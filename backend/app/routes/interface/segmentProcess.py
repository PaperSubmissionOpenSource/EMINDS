import numpy as np
import os

#对于每一个人
def get_seg(file_name,save_name,segment_label_data):
    data = np.load(file_name,allow_pickle=True)
    data_list = data.tolist()
    count = 0
    final = []
    for li in data_list:
        segment = []
        for l in li:
            depression = l[0]
            passive = l[-1]
            active = l[-2]
            cl = segment_label_data[count][-1]
            count+=1
            temp = []
            temp.append(depression)
            temp.append(active)
            temp.append(passive)
            temp.append(cl)
            segment.append(temp)
        final.append(segment)
    result = np.array(final, dtype=object)
    np.save(save_name,result)

def mkdir(path):
	folder = os.path.exists(path)
	if not folder:                  
		os.makedirs(path)
                
def segment_process(dir0, dir1):
    mode = [dir0, dir1]
    loaddir = "app/data/segment/" + dir0 + "_" + dir1 + "/"
    savedir = "app/data/segment_processed/" + dir0 + "_" + dir1 + "/"
    mkdir(savedir)
    data = np.load("app/data/segment/" + dir0 + "_" + dir1 + "/segment_label.npy", allow_pickle=True)
    for t in range(2):
        for i in range(550):
            filename = loaddir + mode[t] + "/user" + str(i+1) + ".npy"
            savename = savedir + mode[t] + "/user" + str(i+1) + ".npy"
            mkdir(savedir + mode[t] + "/")
            if not os.path.exists(filename):
                continue
            target = data[t][i]
            get_seg(filename, savename, target)


