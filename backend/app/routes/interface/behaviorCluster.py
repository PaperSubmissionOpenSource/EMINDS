import json
import os
import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from sklearn.metrics.pairwise import cosine_similarity

def depression_interpolation(d_list):
    new_list = [None if x == -1 else x for x in d_list]
    df = pd.DataFrame(new_list, columns=['values'])
    df.interpolate(method='linear', inplace=True)
    interpolated_list = df['values'].tolist()
    return interpolated_list

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
    print("********************************")
    # 打印聚类中心
    print(estimator.cluster_centers_)
    cos_sim_matrix = cosine_similarity(estimator.cluster_centers_)
    average_cos_sim = np.triu(cos_sim_matrix, 1).mean()
    print("*************余弦相似度*************")
    print(average_cos_sim)
    print((average_cos_sim + 0.1) / 0.2)

    return label_pred, estimator.cluster_centers_, cluster_list

def cluster_active_and_passive_behavior(dir0, dir1, k_active, k_passive):
    dirname = 'app/data/event/'
    mode = [dir0, dir1]
    active_behavior = []
    passive_behavior = []
    for m in mode:
        subdir = dirname + m + '/'
        filenames = os.listdir(subdir)
        for f in filenames:
            if f[0] == "u":
                content = np.load(subdir + f, allow_pickle=True).tolist()
                active_behavior += [[c[1]] + c[3:7] for c in content]
                passive_behavior += [c[7:11] for c in content]
    active_label, active_label_center, active_cluster_list = k_means(k_active, active_behavior)
    passive_label, passive_label_center, passive_cluster_list = k_means(k_passive, passive_behavior)
    np.save("app/data/behaviornpy/active_behavior_center_" + dir0 + "_" + dir1 + ".npy", np.array(active_label_center))
    np.save("app/data/behaviornpy/passive_behavior_center_" + dir0 + "_" + dir1 + ".npy", np.array(passive_label_center))
    count = 0
    for m in mode:
        subdir = dirname + m + '/'
        filenames = os.listdir(subdir)
        for f in filenames:
            if f[0] == "u":
                content = np.load(subdir + f, allow_pickle=True).tolist()
                for i in range(len(content)):
                    content[i] += [active_label[count], passive_label[count]]
                    count += 1
            mkdir("app/data/label/" + dir0 + "_" + dir1)
            mkdir("app/data/label/" + dir0 + "_" + dir1 + '/' + m)
            np.save("app/data/label/" + dir0 + "_" + dir1 + '/'  + m + '/' + f, np.array(content))
    return active_cluster_list, passive_cluster_list

def mkdir(path):
	folder = os.path.exists(path)
	if not folder:                   #判断是否存在文件夹如果不存在则创建为文件夹
		os.makedirs(path)            #makedirs 创建文件时如果路径不存在会创建这个路径

def obtain_depression(dir0, dir1):
    dirname = 'app/data/event/'
    mode = [dir0, dir1]
    depression = [[],[],[]]
    for i in range(len(mode)):
        subdir = dirname + mode[i] + '/'
        filenames = os.listdir(subdir)
        for f in filenames:
            if f[0] == "u":
                content = np.load(subdir + f, allow_pickle=True).tolist()
                depression[i] += [c[0] for c in content]
    return depression
                

