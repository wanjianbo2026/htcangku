import { View, Text } from '@tarojs/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RecordsPage = () => {
  return (
    <View className="page-container">
      <Card className="page-card">
        <CardHeader>
          <CardTitle className="block">所有记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="block">查看所有记录功能开发中...</Text>
        </CardContent>
      </Card>
    </View>
  );
};

export default RecordsPage;
