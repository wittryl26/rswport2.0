export default function handler(req, res) {
    res.status(200).json({
        status: 'success',
        data: []  // Empty data is fine since we only need the gold-rupee endpoint
    });
}
