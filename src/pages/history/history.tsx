import { View, Text } from '@tarojs/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HistoryPage = () => {
  return (
    <View className="page-container">
      <Card className="page-card">
        <CardHeader>
          <CardTitle className="block">上报记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="block">上报记录功能开发中...</Text>
        </CardContent>
      </Card>
    </View>
  );
};

export default HistoryPage;
