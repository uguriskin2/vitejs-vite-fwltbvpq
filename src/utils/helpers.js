export const toTRUpper = (str) => (str || '').toLocaleUpperCase('tr-TR');

export const getInitialQuestion = () => ({
  text: '', type: 'multiple-choice', topic: '', imageUrl: '', options: ['', '', '', ''], correct: 0, correctText: '', pairs: [{left: '', right: ''}, {left: '', right: ''}, {left: '', right: ''}]
});

export const getCorrectAnswerText = (q) => {
    if (q.type === 'multiple-choice') return String.fromCharCode(65 + q.correct) + " - " + q.options[q.correct];
    if (q.type === 'true-false') return q.correct === 0 ? 'DOĞRU' : 'YANLIŞ';
    if (q.type === 'short-answer') return q.correctText;
    if (q.type === 'matching') return q.pairs.map(p => `${p.left} ➔ ${p.right}`).join(" | ");
    return "";
};

export const getGivenAnswerText = (q, ans) => {
    if (ans === undefined || ans === null || ans === '') return 'Boş Bırakıldı';
    if (q.type === 'multiple-choice') return String.fromCharCode(65 + ans) + " - " + q.options[ans];
    if (q.type === 'true-false') return ans === 0 ? 'DOĞRU' : 'YANLIŞ';
    if (q.type === 'short-answer') return String(ans);
    if (q.type === 'matching') {
        if (typeof ans === 'object') return Object.entries(ans).map(([k, v]) => `${k} ➔ ${v}`).join(" | ");
        return String(ans);
    }
    return String(ans);
};

export const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};