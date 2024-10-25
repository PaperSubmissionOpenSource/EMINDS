import json
import os
import math
import numpy as np
import copy
from .GGS.ggs import *
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

def get_index(lst, item):
    tmp = []
    tag = 0
    for i in lst:
        if i == item:
            tmp.append(tag)
        tag += 1
    tmp.append(len(lst))
    return tmp

def list_normalization(lst, attribute_min_max):
    # print(lst)
    for i in range(len(lst)):
        for j in range(len(lst[i])):
            lst[i][j] = (lst[i][j] - attribute_min_max[j][0])/(attribute_min_max[j][1]- attribute_min_max[j][0])
    return lst

def GGS_segment(content_ggs, content_original, segment_number=3):
    # 输入的是要切割的预处理过的数据（比如pca/归一化等）+ 原始数据
    bps, objectives = GGS(np.array(content_ggs).T, segment_number, 1e-4) #bps中每一个元素都是下一个片段刚开始的元素
    if isinstance(bps[-1],list):
        segment_points = bps[-1][1:-1]
        meancovs = GGSMeanCov(np.array(content_ggs).T, bps[-1], 1e-4)
    else:
        segment_points = bps[1:-1]
        meancovs = GGSMeanCov(np.array(content_ggs).T, bps, 1e-4)
    new_segment_data = []
    new_segment_data_ggs = []
    start = 0
    for t in segment_points:
        new_segment_data.append(content_original[start:t])
        new_segment_data_ggs.append(content_ggs[start:t])
        start = t
    new_segment_data.append(content_original[start:])
    new_segment_data_ggs.append(content_ggs[start:])

    new_segment_meancovs = []
    for m in meancovs:
        t = m[0].tolist()
        # for mm in m[1]:
        #     t.extend(mm)
        new_segment_meancovs.append(t)
    return new_segment_data, new_segment_data_ggs, new_segment_meancovs
    
def GGS_max_limit(content_ggs, content_original, segment_number=2, max_segment_number=5):
    new_segment_data, new_segment_data_ggs, new_meancovs = GGS_segment(content_ggs, content_original, segment_number)
    result = []
    result_ggs = []
    result_meancovs = []
    for i in range(len(new_segment_data)):
        if len(new_segment_data[i]) > max_segment_number:
            sub_new_segment_data, sub_new_segment_data_ggs, sub_new_meancovs = GGS_segment(new_segment_data_ggs[i], new_segment_data[i], int(len(new_segment_data[i])/4))
            result += sub_new_segment_data
            result_ggs += sub_new_segment_data_ggs
            result_meancovs += sub_new_meancovs
        else:
            result.append(new_segment_data[i])
            result_ggs.append(new_segment_data_ggs[i])
            result_meancovs.append(new_meancovs[i])
    return result, result_ggs, result_meancovs

def k_means(cluster_number, data):
    scaler = StandardScaler()
    data_scaled = scaler.fit_transform(data)
    estimator = KMeans(n_clusters=cluster_number, random_state=42)
    estimator.fit(data_scaled)
    label_pred = estimator.labels_
    cluster_list = [[] for i in range(cluster_number)]
    for i in range(len(label_pred)):
        cluster_list[label_pred[i]].append(data[i])
    # 查看每个类别的平均值
    print("************类别中心*************")
    for i in range(cluster_number):
        print(i, list(np.mean(cluster_list[i], axis=0)), len(cluster_list[i]))
    print("*************************\n")
    return label_pred
          
def obtain_segment(dir0, dir1, stage_number = 6):
    if os.path.exists("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label.npy"):
        segment_label_result = list(np.load("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label.npy", allow_pickle = True))
        segment_label_result2 = list(np.load("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label2.npy", allow_pickle = True))
        return [stage_number, segment_label_result, segment_label_result2]
    dirname = 'app/data/label/' + dir0 + "_" + dir1 + '/'
    mode = [dir0, dir1]
    event_sequences = []
    active_behavior = []
    passive_behavior = []
    PCA_data = []
    final_segment = {dir0:[], dir1:[]} #存储最后的原始数据的segment
    final_label_segent = {dir0:[], dir1:[]} #存储将最后的原始数据进行kmeans之后的值
    meancovs_data = []
    active_behavior_center = np.load("app/data/behaviornpy/active_behavior_center_" + dir0 + "_" + dir1 + ".npy", allow_pickle=True)
    passive_behavior_center = np.load("app/data/behaviornpy/passive_behavior_center_" + dir0 + "_" + dir1 + ".npy", allow_pickle=True)
    pca = PCA(n_components=1, random_state=42)
    pca.fit(active_behavior_center)
    active_behavior_center_1d = pca.transform(active_behavior_center)
    active_behavior_center_1d = sorted(range(len(active_behavior_center_1d)), key=lambda k: active_behavior_center_1d[k], reverse=True)
    print("**************每一个类别的编号**************:", active_behavior_center_1d)
    pca.fit(passive_behavior_center)
    passive_behavior_center_1d = pca.transform(passive_behavior_center)
    passive_behavior_center_1d = sorted(range(len(passive_behavior_center_1d)), key=lambda k: passive_behavior_center_1d[k], reverse=True)
    print("**************每一个类别的编号**************:", passive_behavior_center_1d)
    for m in mode: 
        subdir = dirname + m + '/'
        filenames = os.listdir(subdir)
        for i in range(550):
            f = "user" + str(i) +'.npy'
            if os.path.exists(subdir + f):
                content = np.load(subdir + f, allow_pickle=True).tolist()
                active_behavior += [[c[1]] + c[3:7] for c in content]
                passive_behavior += [c[7:11] for c in content]
                content_new = []
                for j in range(len(content)):
                    #content[j] = content[j][0:2] + content[j][3:-2]
                    content_new.append([content[j][0]] + [active_behavior_center_1d[int(content[j][-2])]] + [passive_behavior_center_1d[int(content[j][-1])]])
                new_segment_data, _, new_meancovs=  GGS_max_limit(content_new, content, segment_number=5, max_segment_number=5)
                final_segment[m].append(new_segment_data)
                meancovs_data += new_meancovs
                event_sequences += content

    meancovs_label = k_means(stage_number, meancovs_data)

    count_label = 0
    count_label2 = 0

    segment_label_result = [[], []]
    segment_label_result2 = [[], []]
    count_slr = 0
    # 对原始数据进行transform转换到每一个类别
    for m in mode:
        for inum, individual in enumerate(final_segment[m]): # 每一个人
            individual_temp = []
            individual_temp2 = []
            # print("*********************")
            for individual_segment in individual: # 每一个人的每一个segment
                segment_temp = []
                temp_individual_segment = []
                for time_point in individual_segment: # 每一个人的每一个segment中的每一个时间点的数据
                    temp_individual_segment.append([time_point[0], time_point[-2], time_point[-1]])
                    individual_temp.append([time_point[0], time_point[-2], time_point[-1], meancovs_label[count_label2]])
                    segment_temp.append([meancovs_label[count_label2]])
                    count_label += 1
                # print("*", meancovs_label[count_label2], "*", temp_individual_segment)
                count_label2 += 1
                individual_temp2.append(segment_temp)
            segment_label_result[count_slr].append(individual_temp)
            segment_label_result2[count_slr].append(individual_temp2)
            mkdir("app/data/segment/" + dir0 + "_" + dir1)
            mkdir("app/data/segment/" + dir0 + "_" + dir1 + '/' + m)
            np.save("app/data/segment/" + dir0 + "_" + dir1 + '/' +  m + "/" + "user" + str(inum + 1) + ".npy", np.array(individual, dtype=object))
        count_slr += 1
    np.save("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label.npy", np.array(segment_label_result, dtype=object))
    np.save("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label2.npy", np.array(segment_label_result2, dtype=object)) 
    return [stage_number, segment_label_result, segment_label_result2]

def mkdir(path):
	folder = os.path.exists(path)
	if not folder:                   #判断是否存在文件夹如果不存在则创建为文件夹
		os.makedirs(path) 

                    


                        
    
            
                


                

