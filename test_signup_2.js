const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://styyowwhpmizpktkoptw.supabase.co';
const supabaseKey = 'sb_publishable_XCllAJL_RAxakFUrLrpOcA_0rOvUnqd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    console.log('Testing signup with email confirmation disabled...');
    const randEmail = `joao.teste.issac.2023${Date.now()}@gmail.com`;
    console.log('Email:', randEmail);
    const { data, error } = await supabase.auth.signUp({
        email: randEmail,
        password: 'securePassword123'
    });
    
    if (error) {
        console.error('Signup Error:', error.message);
    } else {
        console.log('Signup Success:', data.user ? data.user.email : 'No user object');
        console.log('Session returned?', data.session ? ' YES - AUTO LOGIN WORKS!' : ' NO - Email Confirmation is STILL ENABLED on the server!');
    }
}

testSignup();
