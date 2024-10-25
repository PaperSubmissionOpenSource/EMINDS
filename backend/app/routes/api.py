import json
import os
import logging
import pandas as pd
from time import time
from .interface import behaviorCluster
from .interface import segmentStage
from .interface import stageSummarization
from .interface import segmentProcess
from .interface import patternmining
from .interface import pathmining

from flask import Blueprint, current_app, request, jsonify

LOG = logging.getLogger(__name__)
api = Blueprint('api', __name__)
data_group1 = ''
data_group2 = ''

@api.route('/')
def index():
    print('main url!')
    return json.dumps('/')


@api.route('/initialization/<test_str>')
def initialization(test_str):
    return jsonify(test_str)

@api.route('/transmit_k/<data>')
def transmit_k(data):
    active, passive = behaviorCluster.cluster_active_and_passive_behavior(data.split(',')[0], data.split(',')[1], int(data.split(',')[2]), int(data.split(',')[3]))
    return str([active, passive])

@api.route('/transmit_depression/<data>')
def transmit_depression(data):
    depression = behaviorCluster.obtain_depression(data.split(',')[0], data.split(',')[1])
    return str(depression)

@api.route('/transmit_segment/<data>')
def transmit_segment(data):
    segment = segmentStage.obtain_segment(data.split(',')[0], data.split(',')[1])
    return str(segment)

@api.route('/transmit_stage_summarization/<data>')
def transmit_stage_summarization(data):
    segmentProcess.segment_process(data.split(',')[0], data.split(',')[1])
    stagesummarization = stageSummarization.get_statistics(data.split(',')[0], data.split(',')[1])
    return str(stagesummarization)

@api.route('/transmit_pattern/<data>')
def transmit_pattern(data):
    frequent_pattern = patternmining.obtain_pattern(data.split(',')[0], data.split(',')[1])
    return frequent_pattern

@api.route('/transmit_path/<data>')
def transmit_path(data):
    path = pathmining.obtain_path(data.split(',')[0], data.split(',')[1])
    return path

@api.route('/transmit_dataset/<data>')
def transmit_dataset(dataset):
    print(dataset[0], dataset[1])