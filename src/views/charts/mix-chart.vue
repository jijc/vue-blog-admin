/**
 * @des: 方法描述
 * @param: 首页/图表 /混合图表
 * @author: JiJinChi
 * @date: 2020/7/29 - 3:36 下午
**/
<template>
  <div class="chart-container">
    <chart height="100%" width="100%" />
  </div>
</template>

<script>
import Chart from '@/components/Charts/MixChart'

export default {
  name: 'MixChart',
  components: { Chart }
}
</script>

<style scoped>
.chart-container{
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>

