import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

// 旅行記録アプリのデータモデル。
// owner認可(allow.owner())により、各レコードは作成したユーザー本人のみが
// 読み書きできる(owner用のフィールドはAmplifyが自動で追加する)。
const schema = a.schema({
  Trip: a
    .model({
      title: a.string().required(),
      description: a.string(),
      startDate: a.date(),
      endDate: a.date(),
      entries: a.hasMany('Entry', 'tripId'),
    })
    .authorization((allow) => [allow.owner()]),

  Entry: a
    .model({
      tripId: a.id().required(),
      trip: a.belongsTo('Trip', 'tripId'),
      placeName: a.string().required(),
      memo: a.string(),
      visitedDate: a.date(),
      lat: a.float(),
      lng: a.float(),
      // S3内のオブジェクトキー(amplify/storage/resource.tsで定義したパスに対応)
      photoKey: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
