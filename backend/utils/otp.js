exports.addMinutes = (minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
};

exports.generateOTP = (length = 6) => {
    return Math.floor(
        Math.pow(10, length - 1) +
        Math.random() * Math.pow(10, length - 1)
    ).toString();
};
