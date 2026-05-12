export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '登录',
      navigationBarBackgroundColor: '#667eea',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '登录',
      navigationBarBackgroundColor: '#667eea',
      navigationBarTextStyle: 'white',
    };
