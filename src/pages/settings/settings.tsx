import { View, Text } from '@tarojs/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage = () => {
  return (
    <View className="page-container">
      <Card className="page-card">
        <CardHeader>
          <CardTitle className="block">系统设置</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="block">系统设置功能开发中...</Text>
        </CardContent>
      </Card>
    </View>
  );
};

export default SettingsPage;
