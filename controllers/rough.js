if (req.cookies[userSave]) { // Access the global variable here
    try {
        const decoded = await promisify(jwt.verify)(req.cookies[userSave], process.env.JWT_SECRET);

        db.query('SELECT * FROM staff WHERE username = ?', [decoded.username], (err, results) => {
            if (!results || results.length === 0) {
                return next();
            }
            req.user = results[0];
            return next();
        });
    } catch (err) {
        console.log(err);
        return next();
    }
} else {
    next();
}