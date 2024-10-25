import json
import os
import math
import numpy as np
import copy
from mlxtend.frequent_patterns import apriori
import pandas as pd
import ast

def set2list(data):
    lst = []
    for i in data:
        lst.append(i)
    return lst

def calculate_path(lst, i):
    #计算第i个点前后好坏路径的比例
    result = [0, 0, 0, 0] #前好，前坏，后好，后坏
    if i != 0: #加入前面的所有路径
        for j in range(i):
            if lst[j] < 0:
                #result[1] += lst[j]
                result[1] += -1
            else:
                #result[0] += lst[j]
                result[1] += 1
    if i != len(lst) - 1: #加入后面的所有路径
        for j in range(i + 1, len(lst)):
            if lst[j] < 0:
                #result[3] += lst[j]
                result[3] += -1
            else:
                #result[2] += lst[j]
                result[3] += 1
    return [result[0] + result[1], result[2] + result[3]]

def decompose_list(s, lst):
    def helper(s, parts):
            if not s:
                result.append(parts)
                return
            for num in lst:
                if s.startswith(str(num)):
                    helper(s[len(str(num)):], parts + [num])
    result = []
    helper(s, [])
    return result

def find_substring_positions(s, substr):
    positions = []
    pos = s.find(substr)
    while pos != -1:
        positions.append(pos)
        pos = s.find(substr, pos+1)
    return positions

def split_string(S, P):
    result = []

    while len(S) > 0:
        segment = ''
        for pattern in P:
            if S.startswith(pattern):
                if len(pattern) > len(segment):
                    segment = pattern

        if segment == '':
            # 如果找不到匹配的pattern，说明无法分解字符串
            return None

        result.append(segment)
        S = S[len(segment):]

    return result

def obtain_path(dir0, dir1):
    #frequent pattern
    content = np.load("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label2.npy", allow_pickle = True) 
    sequence = []
    for c in content[0]:
        temp_stage_sequence = []
        for cc in c:
            temp_stage_sequence.append(cc[-1][0])
        sequence.append(temp_stage_sequence)

    for c in content[1]:
        temp_stage_sequence = []
        for cc in c:
            temp_stage_sequence.append(cc[-1][0])
        sequence.append(temp_stage_sequence)

    frequent_pattern = dict(np.load("app/data/segment/" + dir0 + "_" + dir1 + "/pattern.npy", allow_pickle=True).tolist())
    result_return = {}
    count = 0
    for k in frequent_pattern.keys():
        former_all = []
        latter_all = []
        result = [[0, 0], [0, 0]]
        # *****插入计算path*****
        for s in sequence:
            s_string = ''.join(str(i) for i in s)
            if k in s_string:
                positions = find_substring_positions(s_string, k)
                for p in positions:
                    if p == 0 or p + len(k) == len(s_string):
                        continue
                    else:
                        former = s_string[:p]
                        latter = s_string[p+1:]
                        former_all += split_string(former, frequent_pattern.keys())
                        latter_all += split_string(latter, frequent_pattern.keys())
        for f in former_all:
           if frequent_pattern[f][0] > frequent_pattern[f][1]:
               result[0][0] += 1
           else:
               result[0][1] += 1
        for l in latter_all:
           if frequent_pattern[l][0] > frequent_pattern[l][1]:
               result[1][0] += 1
           else:
               result[1][1] += 1
        rf1 = round(result[0][0] / sum(result[0]), 3)
        rl1 = round(result[1][0] / sum(result[1]), 3)
        result_return[k] = [[rf1, 1-rf1], [rl1, 1-rl1]]
        #print(k, result[k])
    return result_return

def obtain_path1(dir0, dir1):
    # 采用了路径分解的方式，这样会多出很多路径
    content = np.load("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label2.npy", allow_pickle = True) 
    sequence = []
    for c in content[0]:
        temp_stage_sequence = []
        for cc in c:
            temp_stage_sequence.append(cc[-1][0])
        sequence.append(temp_stage_sequence)

    for c in content[1]:
        temp_stage_sequence = []
        for cc in c:
            temp_stage_sequence.append(cc[-1][0])
        sequence.append(temp_stage_sequence)

    frequent_pattern = dict(np.load("app/data/segment/" + dir0 + "_" + dir1 + "/pattern.npy", allow_pickle=True).tolist())
    path_transition = {}
    for s in sequence:
        # 对每一个sequence切分成路径片段，比如[1,1,3,4,5,2,3,5] -> [113,45,235]
        temp_path_sequence_list= decompose_list(''.join(str(i) for i in s), list(frequent_pattern.keys()))
        for temp_path_sequence in temp_path_sequence_list:
            value_sequence = []
            path_value_sequence = []
            for t in range(len(temp_path_sequence)):
                value_sequence.append(round(frequent_pattern[temp_path_sequence[t]][0] - frequent_pattern[temp_path_sequence[t]][1], 3))
            # 切分成路径片段完成，比如[1,1,3,4,5,2,3,5] -> [113,45,235]
            for v in range(len(value_sequence)):
                if v != 0 or v != len(value_sequence)-1:
                    path_value_sequence.append(calculate_path(value_sequence, v))
            have_occured = []
            for t in range(len(path_value_sequence)):
                if temp_path_sequence[t] not in have_occured:
                    have_occured.append(temp_path_sequence[t])
                    if temp_path_sequence[t] not in path_transition.keys():
                        path_transition[temp_path_sequence[t]] = [path_value_sequence[t]]
                    else:
                        path_transition[temp_path_sequence[t]].append(path_value_sequence[t])
    result = {}
    for k in path_transition.keys():
        result_temp_f = [0, 0, 0] #前：好，空，坏
        result_temp_l = [0, 0, 0] #后：好，空，坏
        for p in path_transition[k]:
            if p[0] > 0:
                result_temp_f[0] += 1
            elif p[0] == 0:
                result_temp_f[1] += 1
            else:
                result_temp_f[2] += 1
            if p[1] > 0:
                result_temp_l[0] += 1
            elif p[1] == 0:
                result_temp_l[1] += 1
            else:
                result_temp_l[2] += 1
        tf1 = round(result_temp_f[0]/sum(result_temp_f), 2)
        tf2 = round(result_temp_f[1]/sum(result_temp_f), 2)
        tf3 = round(1 - tf1 - tf2, 2)

        tl1 = round(result_temp_l[0]/sum(result_temp_l), 2)
        tl2 = round(result_temp_l[1]/sum(result_temp_l), 2)
        tl3 = round(1 - tl1 - tl2, 2)

        rf1 = 0.5
        rf3 = 0.5
        rl1 = 0.5
        rl3 = 0.5
        if tf2 != 1 and tl2 != 1:
            rf1 = round(tf1/(tf1 + tf3), 2)
            rf3 = round(1 - rf1, 2)
            rl1 = round(tl1/(tl1 + tl3), 2)
            rl3 = round(1 - rl1, 2)
        if tf2 != 1 and tl2 == 1:
            rf1 = round(tf1/(tf1 + tf3), 2)
            rf3 = round(1 - rf1, 2)
            rl1 = rf1
            rl3 = rf3
        if tl2 != 1 and tf2 == 1:
            rl1 = round(tl1/(tl1 + tl3), 2)
            rl3 = round(1 - rl1, 2)
            rf1 = rl1
            rf3 = rl3

        result[k] = [[rf1, rf3], [rl1, rl3]]
        #print(k, result[k])
    return result

if __name__ == "__main__":
    obtain_path("simulated_MHOT", "simulated_MHSW")

                    


                        
    
            
                


                

