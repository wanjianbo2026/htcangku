import { View, Text } from '@tarojs/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UploadPage = () => {
  return (
    <View className="page-container">
      <Card className="page-card">
        <CardHeader>
          <CardTitle className="block">上报任务</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="block">上报任务功能开发中...</Text>
        </CardContent>
      </Card>
    </View>
  );
};

export default UploadPage;
