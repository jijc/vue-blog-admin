import request from '@/utils/request'

// 获取列表
export function fetchList(data) {
  return request({
    url: '/api/article/list',
    method: 'post',
    data
  })
}

// 获取文章
export function fetchArticle(id) {
  return request({
    url: '/api/article/detail',
    method: 'get',
    params: { id }
  })
}

// 创建文章
export function createArticle(data) {
  return request({
    url: '/api/article/save',
    method: 'post',
    data
  })
}

// 删除文章
export function deleteArticle(data) {
  console.log('data', data)
  return request({
    url: '/api/article/del/' + data,
    method: 'delete',
    data
  })
}
