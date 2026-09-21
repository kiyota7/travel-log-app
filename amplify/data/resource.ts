import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

// 旅行記録アプリのデータモデル。
//
// 認可について: Trip/Entry/Profile/Like/Comment/Followは
// owner()(所有者は全操作可)に加えてauthenticated()(ログイン済みなら誰でも
// 読み取り可)を付与している。これは「非公開の旅行・記録も、ログイン済み
// ユーザーが直接GraphQL APIを叩けば技術的には読み取れる」というトレードオフを
// 意味する(レコードのisPublicの値に応じて動的に許可を変えるにはLambdaによる
// カスタム認可が必要で、今回はその実装コストをかけない)。UIからは非公開データへの
// 導線を一切出さないことで、通常の利用では他人に見えないようにする。
// Favoriteは完全に個人利用のデータのため、owner()のみとし他人から一切読めない。
const schema = a.schema({
  Trip: a
    .model({
      title: a.string().required(),
      description: a.string(),
      startDate: a.date(),
      endDate: a.date(),
      // trueの場合、他ユーザーの「みんなの記録」フィードやプロフィールに表示される
      isPublic: a.boolean().default(false),
      entries: a.hasMany('Entry', 'tripId'),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

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
      // 所属するTripのisPublicをクライアント側で複製したもの。
      // フィード表示用のlist/filterはリレーション先のフィールドで絞り込めないため。
      isPublic: a.boolean().default(false),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // 投稿者名・フォロー先の表示名を出すための公開プロフィール。
  // idはCognitoのusername(=owner)と同じ値にする。
  Profile: a
    .model({
      displayName: a.string().required(),
      email: a.string(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  Like: a
    .model({
      entryId: a.id().required(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  Comment: a
    .model({
      entryId: a.id().required(),
      body: a.string().required(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // owner(=フォローする本人)がfollowingId(フォロー対象のユーザーID)をフォローする
  Follow: a
    .model({
      followingId: a.string().required(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

  // 記録のお気に入り保存。本人のみ閲覧可(いいねと違い、他人からは見えない)
  Favorite: a
    .model({
      entryId: a.id().required(),
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
