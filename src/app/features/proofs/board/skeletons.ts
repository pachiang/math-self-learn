import { SkeletonCard } from './skeleton-review.component';

/** Made at the end of chapter 6, reviewed at the start of chapter 7. */
export const CH6_SKELETON: SkeletonCard = {
  title: '偶數加偶數是偶數',
  from: '第 6 章',
  beats: ['令 a、b 為任意整數，假設它們是偶數', '拿到 k、l：a = 2k，b = 2l', '選 m = k + l，代入化簡'],
  decoys: [
    { text: '拿到 k：a = 2k，b = 2k', why: '這是 6.4 那位同學的寫法：同一個 k 等於偷偷假設 a = b。兩次拿到，就要兩個名字。' },
    { text: '選 m = (a + b) / 2', why: '6.5 看過：(a + b) / 2 是不是整數，正是要證的事，不能拿來當證人。' },
  ],
};

/** Made at the end of chapter 7, reviewed at the start of chapter 8. */
export const CH7_SKELETON: SkeletonCard = {
  title: '整除會傳遞：a ∣ b、b ∣ c ⇒ a ∣ c',
  from: '第 7 章',
  beats: ['展開兩條已知，拿到 k、l：b = ak，c = bl', '從 c 往前代入：c = bl = akl', '選 m = kl，代入化簡'],
  decoys: [
    { text: '選 m = 20', why: '20 只對 a = 3、b = 12、c = 60 那一組成立。證人要用拿到的字母寫。' },
    { text: '拿到 k：b = ak，c = bk', why: '兩次拿到用了同一個名字，等於假設兩個商一樣大。' },
  ],
};

/** Made at the end of chapter 8, reviewed at the start of chapter 9. */
export const CH8_SKELETON: SkeletonCard = {
  title: '√2 是無理數（反證）',
  from: '第 8 章',
  beats: ['假設 √2 = p/q，而且 p、q 不都是偶數', 'p² = 2q²，用 8.2 的卡：p 是偶數', '代入 p = 2r：q² = 2r²，q 也是偶數，和「不都是偶數」矛盾'],
  decoys: [
    { text: 'p² = 2q²，所以 p = 2q', why: '(2q)² 是 4q²，不是 2q²。從 p² 是偶數只能拿到「p 是偶數」，要靠 8.2 的卡。' },
    { text: '假設 √2 = p/q，p、q 是任意整數', why: '少了「不都是偶數」，最後就沒有東西可以打架：p、q 都是偶數本來就可能。先約到最簡。' },
  ],
};
