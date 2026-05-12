export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '所有记录' })
  : { navigationBarTitleText: '所有记录' };
