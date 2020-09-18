/**
* @method 类型（文章分类）
* @name vue-blog-admin
* @module 组件存放位置
* @desc 加法运算
* @param {number}
* @author ban chi
* @date 2020/8/4 11:20 上午
* @version （指定发布版本）
**/
<template>
  <div class="app-container">
    <div class="filter-container" style="text-align: right;">
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
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
      type="index"
    >

      <el-table-column :label="$t('table.title')">
        <template slot-scope="{row}">
          <el-tag
            effect="plain"
            :style="`border-color:${row.color};color: ${row.color};`"
          > {{ row.title }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="相关文章数" align="center" width="90">
        <!--        slot-scope="{row}"-->
        <template>
          <span>0</span>
        </template>
      </el-table-column>

      <el-table-column label="颜色" width="140" align="center">
        <template slot-scope="{row}">
          <el-color-picker v-model="row.color" :show-alpha="true" disabled />
        </template>
      </el-table-column>

      <el-table-column label="描述" width="240" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button v-if="row.status!=='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="listQuery.total>0"
      :total="listQuery.total"
      :page.sync="listQuery.page_now"
      @pagination="getList"
    />

    <!-- 新增编辑弹窗 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="400px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="70px"
        style="width: 280px;margin-left:20px;"
      >
        <el-form-item :label="$t('table.title')" prop="title">
          <el-input v-model="temp.title" :maxlength="16" />
        </el-form-item>

        <el-form-item label="颜色">
          <el-color-picker v-model="temp.color" :show-alpha="true" />
        </el-form-item>

        <el-form-item v-if="temp.color" label="预览">
          <el-tag
            effect="plain"
            :style="`border-color:${temp.color};color: ${temp.color};`"
          > {{ temp.title }}
          </el-tag>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="temp.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 挂载数量统计详情 -->
    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>

import { tagList, createTag, deleteTag } from '@/api/tag'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
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
    // typeFilter(type) {
    //   return calendarTypeKeyValue[type]
    // }
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
        total: 0
      },
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: null,
        title: null,
        color: null,
        remark: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        title: [{ required: true, message: '请填写类型名称', trigger: 'blur' }],
        color: [{ required: true, message: '请选择类型所需匹配的颜色', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      tagList(this.listQuery).then(response => {
        console.log('[ - 请求列表 - ]: ', response)
        this.list = response.data.list
        this.listQuery.total = response.data.total
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        id: null,
        title: null,
        color: 'rgba(24, 144, 255, 1)',
        remark: null
      }
    },
    // 打开创建弹窗 FN
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 确定创建
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createTag(this.temp).then(() => {
            // this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    // 打开编辑弹窗
    handleUpdate(row) {
      console.log('[ - 编辑对象 - ]: ', row)
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.createData()
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该类型, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTag(row.id).then((res) => {
          console.log('[ -resres ]: ', res)
          let type = ''
          let title = ''
          if (res.success) {
            title = '成功'
            type = 'success'
            this.list.splice(index, 1)
          } else {
            title = '失败'
            type = 'warning'
          }
          this.$notify({
            title: title,
            message: res.message,
            type: type,
            duration: 2000
          })
        })
      })
    }
  }
}
</script>

<style>
  .el-table__body .el-table__row .el-color-picker .el-color-picker__mask {
    display: none;
  }
</style>
<style scoped lang="scss">
  .el-tag {
    padding: 0 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: middle;
    background: #FFFFFF;
    max-width: 160px;
    height: 26px;
    line-height: 25px;
  }

  .el-color-picker {
    display: block;
  }
</style>
