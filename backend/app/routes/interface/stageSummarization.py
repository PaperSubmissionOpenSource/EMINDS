import numpy as np
import json
from scipy.spatial.distance import euclidean
from fastdtw import fastdtw
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
import os

#对于每个人，得到segement长度为t的元素的数组
#之需要相加就可以了
def get_segment_length_t(segments, t, stage):
    t_length_segment = []
    for segment in segments:
        if len(segment)==t and segment[0][-1] == stage:
            t_length_segment.append([s[0:-1] for s in segment])
    return t_length_segment

#得到长度为t的segment序列数组
def get_data(dir0, dir1, t, stage):
    result = []
    dirname = "app/data/segment_processed/" + dir0 + "_" + dir1 + "/"
    mode = [dir0, dir1]
    #MHOT
    for m in mode:
        for i in range(1, 550):
            filename = dirname + m + "/" + "user" + str(i + 1) + ".npy"
            if not os.path.exists(filename):
                continue
            data = np.load(filename, allow_pickle=True).tolist()
            segment = get_segment_length_t(data, t, stage)
            result = result+segment
    return result

# 定义DTW距离计算函数
def dtw_distance(x, y):
    distance, path = fastdtw(x, y, dist=euclidean)
    return distance, path

# 构建距离矩阵
def build_distance_matrix(data):
    n = data.shape[0]
    distance_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(i, n):
            dist, _ = dtw_distance(data[i], data[j])
            distance_matrix[i, j] = dist
            distance_matrix[j, i] = dist
    return distance_matrix

# 使用层次法聚类并生成k个类
def hierarchical_clustering(data, k):
    distance_matrix = build_distance_matrix(data)
    linkage_matrix = linkage(distance_matrix, "ward")
    clusters = fcluster(linkage_matrix, k, criterion='maxclust')
    result = [[] for _ in range(k)]
    for i, cluster_id in enumerate(clusters):
        result[cluster_id-1].append(data[i])
    return result

# 找到每个类的类中心元素
def find_class_centers(clusters):
    centers = []
    for cluster in clusters:
        min_distance_sum = float("inf")
        center_index = 0
        for i, data_point in enumerate(cluster):
            distance_sum = 0
            for j, other_data_point in enumerate(cluster):
                if i == j:
                    continue
                distance_sum += dtw_distance(data_point, other_data_point)[0]
            if distance_sum < min_distance_sum:
                min_distance_sum = distance_sum
                center_index = i
        centers.append(cluster[center_index])
    return centers
#在上面的代码中，find_class_centers函数计算每个类中所有数据点两两之间的DTW距离之和，并找到和最小的数据点作为该类的类中心。这里的类中心是一个数据点，它代表了该类中所有数据点的中心位置。

def get_representative_segments(dir0, dir1, segment_length, segment_number, stage):
    result = get_data(dir0, dir1, segment_length, stage)
    data = np.array(result)
    # 进行层次聚类并输出结果
    result = hierarchical_clustering(data, k=segment_number)
    # 找到每个类的类中心元素并输出结果
    print(result)
    centers = find_class_centers(result)
    # for i, center in enumerate(centers):
    #     print(f"Center {i + 1}: {center}")
    return centers

#对于每一个人
def get_seg(file_name):
    result_dict = {}
    data = np.load(file_name,allow_pickle=True)
    data_list = data.tolist()
    for li in data_list:
        stage = li[0][-1] #这一个片段属于哪一个stage
        if stage in result_dict.keys():
            result_dict[stage].append([lli[0:-1] for lli in li])
        else:
            result_dict[stage] = [[lli[0:-1] for lli in li]]
    return result_dict

def get_all_segment(dir0, dir1):
    dirname = "app/data/segment_processed/" + dir0 + "_" + dir1 + "/"
    mode = [dir0, dir1]
    segment_all = {}
    for m in mode:
        for i in range(0, 550):
            filename = dirname + m + "/" + "user" + str(i + 1) + ".npy"
            if not os.path.exists(filename):
                continue
            result_dict = get_seg(filename)
            for k in result_dict.keys():
                if k not in segment_all.keys():
                    segment_all[k] = result_dict[k]
                else:
                    segment_all[k] += result_dict[k]
    return segment_all

def get_statistics(dir0, dir1):
    if os.path.exists("app/data/segment_processed/" + dir0 + "_" + dir1 + "/statistics.npy"):
        return np.load("app/data/segment_processed/" + dir0 + "_" + dir1 + "/statistics.npy", allow_pickle = True)[0]
    segment_all = get_all_segment(dir0, dir1)
    segment_length = 5
    representative_segment_number = 4
    statistics_result = {} #每一个time point到底有哪些data point
    for j, k in enumerate(segment_all.keys()):
        representative_segments = get_representative_segments(dir0, dir1, segment_length, representative_segment_number, k) #得到了在stage k下的representative segments
        if k not in statistics_result.keys():
            statistics_result[k] = [[] for i in range(segment_length)]
        for i, segment in enumerate(segment_all[k]):
            print(j, i)
            # 接下里对stage k下的每一个segment与representative segments算距离并与距离最近的进行对齐
            distance_min = 99999
            path_align = []
            for rs in representative_segments:
                distance, path = dtw_distance(segment, rs)
                if distance_min > distance:
                    distance_min = distance
                    path_align = path
            for pair in path_align:
                statistics_result[k][pair[1]].append(segment[pair[0]])
    np.save("app/data/segment_processed/" + dir0 + "_" + dir1 + "/statistics.npy", np.array([statistics_result]))
    statistics_result = np.load("app/data/segment_processed/" + dir0 + "_" + dir1 + "/statistics.npy", allow_pickle = True)[0]
    return statistics_result

if __name__ == "__main__":
    get_statistics()
