import { defineStorage } from '@aws-amplify/backend';

// 旅行記録の写真を保存するS3バケット。
// パスに{entity_id}トークンを使うことで、ログインユーザー本人のCognito
// identityIdごとにフォルダを分け、本人のみがアップロード・削除できるようにする。
export const storage = defineStorage({
  name: 'travelLogPhotos',
  access: (allow) => ({
    'photos/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
