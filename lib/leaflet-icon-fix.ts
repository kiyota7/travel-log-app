import L from 'leaflet';

// leafletのデフォルトマーカー画像はバンドラー経由だと解決に失敗するため、
// CDN上の画像を直接指すように上書きする(よく知られた回避策)。
delete (
  L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown }
)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
