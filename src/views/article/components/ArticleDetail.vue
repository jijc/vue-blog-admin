<template>
  <div class="createPost-container">
    <div class="header-button">
      <el-button
        v-loading="loading"
        style="float:right;"
        size="medium"
        type="primary"
        @click="submitForm"
      >保存
      </el-button>
    </div>
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <div class="createPost-main-container">
        <el-row>
          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>标题</MDinput>
            </el-form-item>
            <div class="postInfo-container">
              <el-row>
                <el-col :span="4">
                  <el-form-item label-width="60px" label="作者:" class="postInfo-container-item">
                    <span style="color: #2c3e50">{{ postForm.author }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="7">
                  <el-form-item label-width="130px" label="发布时间:" class="postInfo-container-item">
                    <el-date-picker
                      v-model="displayTime"
                      type="datetime"
                      format="yyyy-MM-dd HH:mm:ss"
                      :clearable="false"
                      placeholder="日期和时间"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="9">
                  <el-form-item label-width="90px" label="文章类型:" class="postInfo-container-item" prop="tag">
                    <el-drag-select v-model="postForm.tag" style="width:380px;" multiple placeholder="请选择">
                      <el-option v-for="item in options" :key="item.id" :label="item.title" :value="item.id" />
                    </el-drag-select>
                  </el-form-item>
                </el-col>

                <el-col :span="4">
                  <el-form-item label-width="90px" label="重要级别:" class="postInfo-container-item">
                    <el-rate
                      v-model="postForm.importance"
                      :max="3"
                      :colors="['#99A9BF', '#F7BA2A', '#ff9900']"
                      :low-threshold="1"
                      :high-threshold="3"
                      style="display:inline-block"
                    />
                  </el-form-item>
                </el-col>

              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="60px" label="描述:">
          <el-input
            v-model="postForm.remark"
            :rows="1"
            type="textarea"
            class="article-textarea"
            autosize
            placeholder="请输入"
          />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <v-md-editor v-model="postForm.content" height="500px" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import MDinput from '@/components/MDinput'
import ElDragSelect from '@/components/DragSelect' // base on element-ui
import { fetchArticle, createArticle } from '@/api/article'
import { tagList } from '@/api/tag'

const defaultForm = {
  status: 'draft',
  title: '', // 文章题目
  author: '机智的大狸子',
  importance: 1,
  content: '', // 文章内容
  remark: '', // 文章摘要
  display_time: new Date(), // 前台展示时间
  tag: [],
  id: null
}

export default {
  name: 'ArticleDetail',
  components: { MDinput, ElDragSelect },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      console.log('[ - rule, value, callback - ]: ', rule, value, callback)
      let msg = ''
      if (rule.field === 'title') {
        msg = '标题不能为空，请填写一个标题。'
      }
      if (rule.field === 'content') {
        msg = '请输入文章主题内容。'
      }
      if (rule.field === 'tag') {
        msg = '请选择文章标签。'
      }
      if (value === '' || value.length < 1) {
        this.$message({
          message: msg || rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(msg || rule.field + '为必传项'))
      } else {
        callback()
      }
    }

    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      rules: {
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        tag: [{ validator: validateRequire }]
      },
      tempRoute: {},
      value: [],
      options: []
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.remark.length
    },
    lang() {
      return this.$store.getters.language
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.display_time))
      },
      set(val) {
        this.postForm.display_time = new Date(val)
      }
    }
  },
  created() {
    console.log('[ this.isEdit ]: ', this.isEdit)
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
    // fetch tags list
    this.getTagsList()
  },
  methods: {
    fetchData(id) {
      fetchArticle(id).then(response => {
        this.postForm = response.data
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = this.lang === 'zh' ? '创建文章' : 'Create Article'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Article'
      document.title = `${title} - ${this.postForm.id}`
    },
    // 保存表单
    submitForm() {
      this.listLoading = true
      this.$refs.postForm.validate(valid => {
        if (valid) {
          createArticle(this.postForm).then(response => {
            console.log('[ - 保存文章返回 - ]: ', response)
            this.$notify({
              title: response.message,
              message: response.message,
              type: 'success',
              duration: 2000
            })
            this.listLoading = false
          })
          // this.postForm.status = 'published'
          this.loading = false
        } else {
          console.log('error submit!!')
          this.loading = false
          return false
        }
      })
    },

    // fetch tags list
    getTagsList() {
      this.listLoading = true
      tagList({ page_now: 1, page_size: 99999 }).then(response => {
        // console.log('[ - 请求标签列表 - ]: ', response);
        this.options = response.data.list
        this.listLoading = false
      })
    }
  }
}
</script>
<style>
  .el-form-item .el-form-item__error {
    padding-top: 8px !important;
  }
</style>
<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";

  .header-button {
    overflow: hidden;
  }

  .createPost-container {
    position: relative;
    padding: 40px 45px 20px 50px;

    .createPost-main-container {

      .postInfo-container {
        position: relative;
        @include clearfix;
        margin-bottom: 10px;

        .postInfo-container-item {
          float: left;
        }
      }
    }

    .word-counter {
      width: 40px;
      position: absolute;
      right: 10px;
      top: 0px;
    }
  }

  .article-textarea ::v-deep {
    textarea {
      padding-right: 40px;
      resize: none;
      border: none;
      border-radius: 0px;
      border-bottom: 1px solid #bfcbd9;
    }
  }
</style>
