export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '上报记录' })
  : { navigationBarTitleText: '上报记录' };
