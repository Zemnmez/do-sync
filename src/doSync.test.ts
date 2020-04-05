import { doSync } from './index';

const fn = async (a: string, b: number, c: string) =>
    `${a}${b}${c}`;



describe('doSync', () => {
    test('basic', () => {
        expect(doSync(fn)('ok', 1, 'ok'))
    });
});