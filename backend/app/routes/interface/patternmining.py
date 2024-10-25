import json
import os
import numpy as np
import pandas as pd
import ast
from collections import defaultdict

def count_subsequences(seq_set, alpha):
    freq1 = defaultdict(int)  # 构建一个默认值为0的字典
    freq2 = defaultdict(int)
    threshold = alpha * len(seq_set)
    for seq in seq_set:
        temp_list = [] #记录出现过的
        for i in range(len(seq)):
            for j in range(i+1, len(seq)+1):
                subseq = seq[i:j]
                freq1[subseq] += 1  # 将子序列添加到字典中并增加出现次数
                if subseq not in temp_list:
                    freq2[subseq] += 1
                    temp_list.append(subseq)
    result = {}
    for k in freq2.keys():
        if freq2[k] > threshold:
            result[k] = round(freq2[k]/len(seq_set), 3)
    return result

def set2list(data):
    lst = []
    for i in data:
        lst.append(i)
    return lst

def obtain_pattern(dir0, dir1):
    # 得到MHOT, MHSW的frequent pattern
    content = np.load("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label2.npy", allow_pickle = True) 
    sequence_better = []
    sequence_worse = []
    for c in content[0]:
        temp_stage_sequence = []
        for cc in c:
            temp_stage_sequence.append(str(cc[-1][0]))
        sequence_better.append(''.join(temp_stage_sequence))

    for c in content[1]:
        temp_stage_sequence = []
        for cc in c:
            temp_stage_sequence.append(str(cc[-1][0]))
        sequence_worse.append(''.join(temp_stage_sequence))
    
    dict_1_o = count_subsequences(sequence_better, 0.05)
    dict_2_o = count_subsequences(sequence_worse, 0.05)

    dict_1 = {}
    dict_2 = {}
    for key in dict_1_o.keys():
        if len(key) <= 3:
            dict_1[key] = dict_1_o[key]

    for key in dict_2_o.keys():
        if len(key) <= 3:
            dict_2[key] = dict_2_o[key]
    # dict_1 = delete_repeated(dict_1)
    # dict_2 = delete_repeated(dict_2)
    dict_new = {}
    for d1 in dict_1:
        for d2 in dict_2:
            if d1 == d2:
                dict_new[d1] = [round(dict_1[d1], 3), round(dict_2[d2], 3)]
    
    for d2 in dict_2:
        for d1 in dict_1:
            if d1 == d2 and d2 not in dict_new:
                dict_new[d1] = [round(dict_1[d1], 3), round(dict_2[d2], 3)]

    difference = []
    for d in dict_new:
        difference.append((d, dict_new[d], round(dict_new[d][0] - dict_new[d][1], 3)))   

    result = sorted(difference, key=lambda d : d[2], reverse=True)
    result_new = {}
    result_key = []
    for r in result:
        result_new[r[0]] = r[1]
        result_key.append(r[0])
    np.save("app/data/segment/" + dir0 + "_" + dir1 + "/pattern.npy", np.array(result_new, dtype=object))
    return [result_new, result_key]

def delete_repeated(dict_test):
    t_keys = list(dict_test.keys())
    keys = sorted(t_keys,key=lambda x: len(x))
    dict_map = {}
    for i in range(len(keys)):
        super = []
        s = keys[i]
        for j in range(i+1,len(keys)):
            if s in keys[j]:
                super.append(keys[j])
        dict_map[s] = super

    len_map = len(keys)-1
    while len_map>=0:
        key = keys[len_map]
        key_count = dict_test[key]
        super_list = dict_map[key]
        for super in super_list:
            key_count = key_count - dict_test[super]
        dict_test[key] = key_count
        len_map -=1
    return dict_test

if __name__ == "__main__":
    obtain_pattern('simulated_MHOT', 'simulated_MHSW')





                    


                        
    
            
                


                

