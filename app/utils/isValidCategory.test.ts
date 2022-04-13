import { isValidCategory } from './isValidCategory';

test("isValidCategory returns valid string", () => {
    expect(isValidCategory.parse('value')).toBe('value');
});

test("isValidCategory throws error on empty string", () => {
    expect(() => isValidCategory.parse('')).toThrowError(/Category name cannot be empty/);
});