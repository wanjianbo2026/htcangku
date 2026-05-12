export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '上报任务' })
  : { navigationBarTitleText: '上报任务' };
