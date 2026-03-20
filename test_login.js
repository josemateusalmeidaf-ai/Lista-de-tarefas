const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://styyowwhpmizpktkoptw.supabase.co';
const supabaseKey = 'sb_publishable_XCllAJL_RAxakFUrLrpOcA_0rOvUnqd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Testing login...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'joao.teste.issac.20231774003867355@gmail.com', // The one I just registered
        password: 'securePassword123'
    });
    
    if (error) {
        console.error('Login Error:', error.message);
    } else {
        console.log('Login Success:', data.user ? data.user.email : 'No user object');
    }
}

testLogin();
