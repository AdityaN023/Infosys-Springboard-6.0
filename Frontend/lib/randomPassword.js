export default function generatePassword(length = 10) {
    if (length < 8) {
        throw new Error("Password length must be greater than 8");
    }

    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+[]{}|;:,.<>?";

    // Ensure at least one character from each category
    const requiredChars = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        special[Math.floor(Math.random() * special.length)],
    ];

    const allChars = upper + lower + numbers + special;

    // Fill the remaining characters
    while (requiredChars.length < length) {
        requiredChars.push(
            allChars[Math.floor(Math.random() * allChars.length)]
        );
    }

    // Shuffle to avoid predictable patterns
    return requiredChars
        .sort(() => Math.random() - 0.5)
        .join("");
}