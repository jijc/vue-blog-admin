import request from '@/utils/request'

// 获取tag列表
export function tagList(query) {
  return request({
    url: '/api/tag/list',
    method: 'get',
    params: query
  })
}

// 创建 编辑 类型
export function createTag(data) {
  return request({
    url: '/api/tag/save',
    method: 'post',
    data
  })
}

// 删除
export function deleteTag(data) {
  return request({
    url: '/api/tag/del/' + data,
    method: 'delete',
    data
  })
}
