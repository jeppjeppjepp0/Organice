const router = require('express').Router();
const { Musician, Gigs, Instruments,  Songs, Media } = require('../models');
const withAuth = require('../utils/auth');

// homepage
router.get('/', async (req, res) => {
  try {
    const musicianData = await Musician.findAll({
        include: [
            {
                model: Gigs,
                attributes: [
                    'name', 
                    'location', 
                    'date', 
                    'capacity',
                    'admission', 
                    'description'
                ],
            },
        ],
    });

    const musicians = musicianData.map((user) =>
        user.get({ plain: true })
    );

    res.render('homepage', {
        musicians,
        logged_in: req.session.logged_in 
    });
  } catch (err) {
        console.log(err);
        res.status(500).json(err);
  }
});

// specific user
router.get('/musician/:id', withAuth, async (req, res) => {
  try {
    const musicianData = await Musician.findByPk(req.params.id, {
        include: [
            {
                model: Gigs,
                attributes: [
                    'name', 
                    'location', 
                    'date', 
                    'capacity',
                    'admission', 
                    'description'
                ],
            },
            {
                model: Instruments,
                attributes: [
                    'name', 
                    'description'
                ],
                as: 'played_instruments'
            },
            {
                model: Songs,
                attributes: [
                    'name', 
                    'description',
                    'genre',
                    'originalAuthor'
                ],
                as: 'performed_songs'
            },
            {
                model: Media,
                attributes: [
                    'media_url'
                ],
            }
        ],
    });

    const musician = musicianData.get({ plain: true });
    res.render('profile', { 
        musician,
        logged_in: req.session.logged_in ,
        is_user: false
    });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// personal account
router.get('/profile', withAuth, async (req, res) => {
    try {
        // Find the logged in user based on the session ID
        const musicianData = await Musician.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Gigs,
                    attributes: [
                        'name', 
                        'location', 
                        'date', 
                        'capacity',
                        'admission', 
                        'description'
                    ],
                },
                {
                    model: Instruments,
                    attributes: [
                        'name', 
                        'description'
                    ],
                    as: 'played_instruments'
                },
                {
                    model: Songs,
                    attributes: [
                        'name', 
                        'description',
                        'genre',
                        'originalAuthor'
                    ],
                    as: 'performed_songs'
                },
                {
                    model: Media,
                    attributes: [
                        'media_url'
                    ],
                }
            ],
        });
  
        const user = musicianData.get({ plain: true });
    
        res.render('profile', {
            ...user,
            logged_in: req.session.logged_in,
            is_user: true
        });
    } catch (err) {
      res.status(500).json(err);
    }
});


// login
router.get('/login', (req, res) => {
    // If the user is already logged in, redirect the request to another route
    if (req.session.logged_in) {
        res.redirect('/profile');
        return;
    }
  
    res.render('login');
  });

module.exports = router;