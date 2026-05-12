export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/login',
    'pages/register/register',
    'pages/users/users',
    'pages/upload/upload',
    'pages/history/history',
    'pages/records/records',
    'pages/score/score',
    'pages/score-manage/score-manage',
    'pages/leaderboard/leaderboard',
    'pages/settings/settings',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '海豚电竞',
    navigationBarTextStyle: 'black'
  }
})
