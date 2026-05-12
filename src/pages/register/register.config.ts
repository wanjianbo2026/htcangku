export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '注册',
      navigationBarBackgroundColor: '#667eea',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '注册',
      navigationBarBackgroundColor: '#667eea',
      navigationBarTextStyle: 'white',
    };
