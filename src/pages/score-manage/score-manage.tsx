import { View, Text } from '@tarojs/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ScoreManagePage = () => {
  return (
    <View className="page-container">
      <Card className="page-card">
        <CardHeader>
          <CardTitle className="block">积分管理</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="block">积分管理功能开发中...</Text>
        </CardContent>
      </Card>
    </View>
  );
};

export default ScoreManagePage;
