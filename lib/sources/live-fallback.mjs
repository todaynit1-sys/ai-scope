// Keep the newest known rows for a failed source, including on ephemeral hosts.
export function preserveFailedSources(current, previous) {
  const failed = current.sources.filter(s => s.state === 'error');
  const retained = previous?.models.filter(m => failed.some(s => s.source === m.source)) || [];
  return {
    ...current,
    models: [...current.models, ...retained],
    stale: failed.length > 0,
    notice: failed.length === 0 ? undefined : retained.length > 0
      ? '수집에 실패한 자료는 이전 수집값을 유지합니다. 각 행의 수집 시각을 확인하세요.'
      : '일부 자료를 가져오지 못했습니다. 잠시 후 다시 갱신하세요.',
  };
}
