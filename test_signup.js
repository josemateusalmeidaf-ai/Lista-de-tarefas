const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://styyowwhpmizpktkoptw.supabase.co';
const supabaseKey = 'sb_publishable_XCllAJL_RAxakFUrLrpOcA_0rOvUnqd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    console.log('Testing signup...');
    const { data, error } = await supabase.auth.signUp({
        email: `joao.teste.issac.2023${Date.now()}@gmail.com`,
        password: 'securePassword123'
    });
    
    if (error) {
        console.error('Signup Error:', error.message);
    } else {
        console.log('Signup Success:', data.user ? data.user.email : 'No user object', 'Session:', data.session ? 'Yes' : 'No');
    }
}

testSignup();
