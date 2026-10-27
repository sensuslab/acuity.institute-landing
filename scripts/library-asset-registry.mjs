export function createAssetRegistry(registry) {
  if (registry?.version !== 1 || !Array.isArray(registry.assets)) throw new Error('Unsupported R2 asset registry');
  const byLegacy = new Map();
  for (const asset of registry.assets) {
    const ext = asset.format === 'text' ? 'txt' : asset.format;
    if (!['pdf','epub','pptx','text'].includes(asset.format) || !/^[a-f0-9]{64}$/.test(asset.sha256 || '') ||
      !Number.isSafeInteger(asset.bytes) || asset.bytes < 1 || asset.status !== 'verified' || !asset.verifiedAt ||
      !['public','private'].includes(asset.visibility) ||
      asset.key !== `library/assets/${asset.sha256}.${ext}` ||
      asset.url !== `https://assets.acuity.institute/${asset.key}` ||
      !/^\/library\/(books|overviews)\//.test(asset.legacyUrl || '')) throw new Error('Unverified or invalid R2 asset identity');
    const legacy = decodeURIComponent(asset.legacyUrl);
    if (legacy.includes('\\') || legacy.includes('\0') || legacy.split('/').includes('..') || !legacy.endsWith('.'+ext)) throw new Error('Unsafe R2 legacy path');
    if (byLegacy.has(legacy)) throw new Error('Duplicate R2 legacy path');
    byLegacy.set(legacy,asset);
  }
  return {
    assets:[...byLegacy.values()],
    get(url,expected) {
      const asset = byLegacy.get(decodeURIComponent(url));
      if (!asset || (expected && ['sha256','bytes','format'].some(key=>expected[key] !== asset[key]))) throw new Error(`R2 identity not verified: ${url}`);
      return asset;
    }
  };
}
