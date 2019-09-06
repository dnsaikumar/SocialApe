let db = {
    users: [
        userId: 'AdaJAdKHAkjkjkscac',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2019-08-26T06:55:07.577Z',
        imageUrl: 'image/assdsasda/asdasdasda',
        bio: 'Hello my name is user, nice to meet you',
        website: 'https://user.com',
        location: 'London, UK'
    ],
    screams: [
        {
            userHandle: 'user',
            body: 'this is the scream body',
            createdAt: '2019-08-26T06:55:07.577Z',
            likeCount: 5,
            commentCount: 2
        }
    ],
    comments: [
        {
            userHandle: 'user',
            screamId: 'dafafafAAsdASDasdadasd',
            body: 'Nice one mate!!',
            createdAt: '2019-08-26T06:55:07.577Z'
        }
    ]
};

const userDetails = {
    //Redux data
    credentials: {
        userId: 'NaXDksdjskdjNJFJ',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2019-08-26T06:55:07.577Z',
        imgUrl: 'image/dsdfghtklolkdnc/dfghdjshfg',
        bio: 'Hellow World!!',
        website: 'https://user.com',
        location: 'London, UK'
    },
    likes: [{
        userHandle: 'user',
        screamId: 'vxczvafsdfasfasdfsadf'
    },
    {
        userHandle: 'user',
        screamId: 'sfsgsdgsadgasdweewrqw'
    }]
}