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
    content = np.load("../../data/segment/" + dir0 + "_" + dir1 + "/segment_label2.npy", allow_pickle = True) 
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

    sequence_all = sequence_better + sequence_worse
    ratio_list = [0.01, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5]

    for r in ratio_list:
        # dict_1_o = count_subsequences(sequence_better, r)
        # dict_2_o = count_subsequences(sequence_worse, r)
        dict_o = count_subsequences(sequence_all, r)
        print('************\n', r)
        # average_length1, average_frequencies1, pattern_counts1, pattern_ratios1 = process_frequent_patterns(dict_1_o)
        # average_length2, average_frequencies2, pattern_counts2, pattern_ratios2 = process_frequent_patterns(dict_2_o)
        average_length, average_frequencies, pattern_counts, pattern_ratios = process_frequent_patterns(dict_o)
        print('num:', len(dict_o))
        print(average_length)
        print(pattern_counts)
        print(pattern_ratios)    
        # print(average_length1)
        # print(average_frequencies1)
        # print(pattern_counts1)
        # print(pattern_ratios1)
        # print('------------')
        # print('num:', len(dict_2_o))
        # print(average_length2)
        # print(average_frequencies2)
        # print(pattern_counts2)
        # print(pattern_ratios2)
        # print('************\n')


def process_frequent_patterns(dict1):
    pattern_lengths = []
    pattern_counts = {}
    pattern_ratios = {}
    pattern_frequencies = {}
    
    for pattern, frequency in dict1.items():
        pattern_length = len(pattern)
        pattern_lengths.append(pattern_length)
        
        if pattern_length in pattern_frequencies:
            pattern_frequencies[pattern_length].append(frequency)
        else:
            pattern_frequencies[pattern_length] = [frequency]
        
        if pattern_length in pattern_counts:
            pattern_counts[pattern_length] += 1
        else:
            pattern_counts[pattern_length] = 1
    
    unique_lengths = set(pattern_lengths)
    average_frequencies = {}
    
    for length in unique_lengths:
        average_frequencies[length] = sum(pattern_frequencies[length]) / len(pattern_frequencies[length])
        pattern_ratios[length] = pattern_counts[length] / len(pattern_lengths)
    
    average_length = sum(pattern_lengths) / len(pattern_lengths)
    
    return average_length, average_frequencies, pattern_counts, pattern_ratios

if __name__ == "__main__":
    obtain_pattern('simulated_MHOT', 'simulated_MHSW')





                    


                        
    
            
                


                

