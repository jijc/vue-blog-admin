/**
 * @des: 方法描述
 * @param: 首页/图表 /折线图
 * @author: JiJinChi
 * @date: 2020/7/29 - 3:35 下午
**/
<template>
  <div class="chart-container">
    <chart height="100%" width="100%" />
  </div>
</template>

<script>
import Chart from '@/components/Charts/LineMarker'

export default {
  name: 'LineChart',
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

