/**
* @des: 首页/文档
* @param: 无
* @author: JiJinChi
* @date: 2020/7/29 - 4:13 下午
**/
<template>
  <div class="app-container article-list">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        :placeholder="$t('table.title')"
        style="width: 220px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.importance"
        :placeholder="$t('table.importance')"
        clearable
        style="width: 120px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in importanceOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>

      <el-select
        v-model="listQuery.tag"
        :placeholder="$t('table.tag')"
        clearable
        class="filter-item"
        style="width: 120px"
        @change="handleFilter"
      >
        <el-option v-for="item in tagsOptions" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>

      <el-select v-model="listQuery.sort" style="width: 120px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>

      <router-link to="/article/create" style="margin-right: 10px;">
        <el-button type="primary" size="mini" class="filter-item" icon="el-icon-edit">
          {{ $t('table.add') }}
        </el-button>
      </router-link>

      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        {{ $t('table.export') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        :label="$t('table.id')"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row,$index}">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.date')" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.display_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.title')" min-width="150px">
        <template slot-scope="{row}">
          <router-link target="_blank" :to="'/article/edit/'+row.id" style="margin-right: 10px;">
            <span class="link-type">{{ row.title }}</span>
          </router-link>
          <el-tag
            v-for="(item,index) in row.tag"
            :key="index"
            effect="plain"
            :style="`color:${tagsObj[item].color};border-color:${tagsObj[item].color};`"
          >
            {{ tagsObj[item].title }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.author')" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.importance')" align="center" width="80px">
        <template slot-scope="{row}">
          <svg-icon v-for="n in +row.importance" :key="n" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.readings')" align="center" width="95">
        <!--        <template slot-scope="{row}">-->
        <span>0</span>
        <!--        </template>-->
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <router-link target="_blank" :to="'/article/edit/'+row.id" style="margin-right: 10px;">
            <el-button type="primary" size="mini">
              {{ $t('table.edit') }}
            </el-button>
          </router-link>
          <el-button
            v-if="row.status!=='published'"
            size="mini"
            type="success"
            @click="handleModifyStatus(row,'published')"
          >
            {{ $t('table.publish') }}
          </el-button>
          <el-button
            v-if="row.status!=='draft'"
            size="mini"
            @click="handleModifyStatus(row,'draft')"
          >
            {{ $t('table.draft') }}
          </el-button>
          <el-button v-if="row.status!=='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page_now"
      :limit.sync="listQuery.page_size"
      @pagination="getList"
    />
    <!--    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">-->
    <!--      <el-form-->
    <!--        ref="dataForm"-->
    <!--        :rules="rules"-->
    <!--        :model="temp"-->
    <!--        label-position="left"-->
    <!--        label-width="70px"-->
    <!--        style="width: 400px; margin-left:50px;"-->
    <!--      >-->
    <!--        <el-form-item :label="$t('table.type')" prop="type">-->
    <!--          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">-->
    <!--            <el-option-->
    <!--              v-for="item in tagsOptions"-->
    <!--              :key="item.id"-->
    <!--              :label="item.name"-->
    <!--              :value="item.id"-->
    <!--            />-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item :label="$t('table.date')" prop="timestamp">-->
    <!--          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item :label="$t('table.title')" prop="title">-->
    <!--          <el-input v-model="temp.title" />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item :label="$t('table.status')">-->
    <!--          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">-->
    <!--            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item :label="$t('table.importance')">-->
    <!--          <el-rate-->
    <!--            v-model="temp.importance"-->
    <!--            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"-->
    <!--            :max="3"-->
    <!--            style="margin-top:8px;"-->
    <!--          />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item :label="$t('table.remark')">-->
    <!--          <el-input-->
    <!--            v-model="temp.remark"-->
    <!--            :autosize="{ minRows: 2, maxRows: 4}"-->
    <!--            type="textarea"-->
    <!--            placeholder="Please input"-->
    <!--          />-->
    <!--        </el-form-item>-->
    <!--      </el-form>-->
    <!--      <div slot="footer" class="dialog-footer">-->
    <!--        <el-button @click="dialogFormVisible = false">-->
    <!--          {{ $t('table.cancel') }}-->
    <!--        </el-button>-->
    <!--        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">-->
    <!--          {{ $t('table.confirm') }}-->
    <!--        </el-button>-->
    <!--      </div>-->
    <!--    </el-dialog>-->

    <!--    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">-->
    <!--      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">-->
    <!--        <el-table-column prop="key" label="Channel" />-->
    <!--        <el-table-column prop="pv" label="Pv" />-->
    <!--      </el-table>-->
    <!--      <span slot="footer" class="dialog-footer">-->
    <!--        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>-->
    <!--      </span>-->
    <!--    </el-dialog>-->

  </div>
</template>

<script>

import { fetchList, createArticle, deleteArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { tagList } from '@/api/tag' // secondary package based on el-pagination

export default {
  name: 'ArticleList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }

  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page_now: 1,
        page_size: 20,
        importance: null,
        title: null,
        tag: null,
        sort: '-'
      },
      importanceOptions: [{ label: '☆', key: 1 }, { label: '☆ ☆', key: 2 }, { label: '☆ ☆ ☆', key: 3 }],
      tagsOptions: [],
      tagsObj: {},
      sortOptions: [{ label: '降序', key: '-' }, { label: '升序', key: '+' }],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        status: null,
        title: null, // 文章题目
        author: null,
        importance: null,
        content: null, // 文章内容
        remark: null, // 文章摘要
        display_time: null, // 前台展示时间
        tag: [],
        id: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getTagsList()
  },
  methods: {
    getList() {
      this.listLoading = true
      const data = Object.assign({}, this.listQuery)
      data.importance = data.importance || 0
      fetchList(data).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },

    handleFilter() {
      this.listQuery.page_now = 1
      this.getList()
    },

    handleModifyStatus(row, status) {
      this.listLoading = true
      row.status = status
      createArticle(row).then(response => {
        console.log('[ - 保存文章返回 - ]: ', response)
        this.$notify({
          title: response.message,
          message: response.message,
          type: 'success',
          duration: 2000
        })
      })
      this.listLoading = false
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'descending') {
        this.listQuery.sort = '-'
      } else {
        this.listQuery.sort = '+'
      }
      this.handleFilter()
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      console.log('[ row, index- ]: ', row, index)
      console.log('[ -this.temp.id ]: ', this.temp.id)
      this.$confirm('此操作将永久删除该类型, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteArticle(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
        this.list.splice(index, 1)
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    // fetch tags list
    getTagsList() {
      this.listLoading = true
      tagList({ page_now: 1, page_size: 99999 }).then(response => {
        this.tagsOptions = response.data.list
        // 整理 tags 数据 为渲染
        this.rearrangeTags()
        // 获取文章列表
        this.getList()
        this.listLoading = false
      })
    },
    rearrangeTags() {
      this.tagsObj = {}
      this.tagsOptions.forEach((v, i) => {
        this.tagsObj[v.id] = { id: v.id, title: v.title, color: v.color }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .article-list {
    .filter-container {
      .filter-item {
        margin-right: 10px;
      }
    }

    .el-table {
      .el-table__body-wrapper {
        .el-table__row {
          .cell {
            .el-tag {
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
</style>

