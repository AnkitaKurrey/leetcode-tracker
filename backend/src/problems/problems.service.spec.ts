import { titleFromUrl } from './problems.service';

describe('titleFromUrl', () => {
  it('derives a title from the problem slug', () => {
    expect(titleFromUrl('https://leetcode.com/problems/two-sum/')).toBe(
      'Two Sum',
    );
    expect(
      titleFromUrl(
        'https://leetcode.com/problems/longest-substring-without-repeating-characters/description/',
      ),
    ).toBe('Longest Substring Without Repeating Characters');
    expect(titleFromUrl('https://leetcode.cn/problems/3sum')).toBe('3sum');
  });

  it('returns null when there is no slug', () => {
    expect(titleFromUrl(null)).toBeNull();
    expect(titleFromUrl('')).toBeNull();
    expect(titleFromUrl('https://leetcode.com/')).toBeNull();
  });
});
