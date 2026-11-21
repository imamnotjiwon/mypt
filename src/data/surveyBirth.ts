/** 생년월일 → 만나이 */
export function ageFromBirth(year: string, month: string, day: string) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return '';
  if (y < 1920 || y > new Date().getFullYear()) return '';
  if (m < 1 || m > 12 || d < 1 || d > 31) return '';
  const birth = new Date(y, m - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return '';
  if (birth > new Date()) return '';

  const now = new Date();
  let age = now.getFullYear() - y;
  const beforeBirthday = now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d);
  if (beforeBirthday) age -= 1;
  if (age < 1 || age > 120) return '';
  return String(age);
}

export function birthFieldsComplete(year: string, month: string, day: string) {
  return Boolean(ageFromBirth(year, month, day));
}

/** 집이면 기구 질문 유지, 헬스장/공원만이면 기구 생략 */
export function needsEquipment(places: string[]) {
  return places.includes('집');
}
