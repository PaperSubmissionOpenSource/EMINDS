import axios from 'axios'
import globalConfig from './globalConfig'
const GET_REQUEST = 'get'
const POST_REQUEST = 'post'
const dataServerUrl = `http://127.0.0.1:${globalConfig.backendPort}/api`

function request(url, params, type, callback) {
    let func
    if (type === GET_REQUEST) {
        func = axios.get
    } else if (type === POST_REQUEST) {
        func = axios.post
    }

    func(url, params).then((response) => {
            if (response.status === 200) {
                callback(response["data"])
            } else {
                console.error(response) /* eslint-disable-line */
            }
        })
        .catch((error) => {
            console.error(error) /* eslint-disable-line */
        })
}

function transmit_k(data, callback) {
    const url = `${dataServerUrl}/transmit_k/${data}`
    const params = {}
    request(url, params, GET_REQUEST, callback)
}

function transmit_segment(data, callback) {
    const url = `${dataServerUrl}/transmit_segment/${data}`
    const params = {}
    request(url, params, GET_REQUEST, callback)
}

function transmit_stage_summarization(data, callback) {
    const url = `${dataServerUrl}/transmit_stage_summarization/${data}`
    const params = {}
    request(url, params, GET_REQUEST, callback)
}

function transmit_pattern(data, callback) {
    const url = `${dataServerUrl}/transmit_pattern/${data}`
    const params = {}
    request(url, params, GET_REQUEST, callback)
}

function transmit_path(data, callback) {
    const url = `${dataServerUrl}/transmit_path/${data}`
    const params = {}
    request(url, params, GET_REQUEST, callback)
}

function transmit_depression(data, callback) {
    const url = `${dataServerUrl}/transmit_depression/${data}`
    const params = {}
    request(url, params, GET_REQUEST, callback)
}

function transmit_dataset(data, callback) {
    const url = `${dataServerUrl}/transmit_dataset/${data}`
    const params = {}
    request(url, params, GET_REQUEST, callback)
}

export default {
    dataServerUrl,
    transmit_k,
    transmit_segment,
    transmit_stage_summarization,
    transmit_pattern,
    transmit_path,
    transmit_depression,
    transmit_dataset
}