
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uztagjejpcbxgnnhsysg.supabase.co';
const supabaseKey = 'sb_publishable_Ef2SiaTk7XjnEBrAQPcgqw_eyinpmjx';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    try {
        console.log('Fetching categories...');
        const { data: categories, error: catError } = await supabase.from('categories').select('*');
        if (catError) throw catError;
        console.table(categories);

        console.log('\nFetching products (first 10)...');
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('name, category_id, description, highlights')
            .limit(10);
        if (prodError) throw prodError;

        console.log(JSON.stringify(products, null, 2));

        console.log('\nSearching for "Samsung"...');
        const { data: samsungProducts } = await supabase
            .from('products')
            .select('name, category_id, description')
            .ilike('name', '%Samsung%');

        console.log('Samsung products found:', samsungProducts?.length || 0);
        if (samsungProducts?.length) console.table(samsungProducts);

        console.log('\nSearching for "iPhone"...');
        const { data: iphoneProducts } = await supabase
            .from('products')
            .select('name, category_id, description')
            .ilike('name', '%iPhone%');

        console.log('iPhone products found:', iphoneProducts?.length || 0);
        if (iphoneProducts?.length) console.table(iphoneProducts);

    } catch (err) {
        console.error('Inspection failed:', err);
    }
}

inspect();
