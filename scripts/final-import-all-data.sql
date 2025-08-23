-- ============================================
-- COMPLETE DATA IMPORT SCRIPT FOR SUPABASE
-- This script only imports data, doesn't recreate tables
-- Run this entire script in your Supabase SQL Editor
-- ============================================

-- Step 1: Import all missing brands (if any)
INSERT INTO brands (name) 
SELECT DISTINCT brand_name FROM (VALUES
  ('305 Care'),
  ('Ameli'),
  ('Bauhaus'),
  ('Farben Löwe'),
  ('Hydraid'),
  ('IEA'),
  ('IOS'),
  ('ImmoScout24'),
  ('KikiKoala'),
  ('Kulturwerke'),
  ('Lotto24'),
  ('Purelei'),
  ('Riegel'),
  ('Rudelkönig'),
  ('Stryve'),
  ('Störtebekker'),
  ('TERRACanis'),
  ('TerraCanis'),
  ('Valkental'),
  ('Vonmählen'),
  ('Zahnheld'),
  ('girlgotlashes'),
  ('heideman')
) AS t(brand_name)
WHERE NOT EXISTS (
  SELECT 1 FROM brands WHERE brands.name = t.brand_name
);

-- Step 2: Import all influencers from the CSV
INSERT INTO influencers (name, instagram_handle, status)
SELECT DISTINCT influencer_name, 
       LOWER(REGEXP_REPLACE(influencer_name, '[^a-zA-Z0-9._]', '', 'g')) as handle,
       'active' as status
FROM (VALUES
  ('quintyna'),('mariannastyletrends'),('happy_brackmann'),('papi.of.two'),
  ('plotterkrams'),('tina_mom_91'),('blondbynana'),('kathiwohnt'),
  ('flightgirl.sarah'),('yasemin.bdx'),('stephis.familienleben'),('zoelwe'),
  ('diedaywalker'),('janna.ferdi'),('sabrinaroeder'),('lykke.linda'),
  ('deinetanzlehrerin'),('der_flory'),('leila.kocht'),('mrs.linchenn'),
  ('tschossl'),('Eckerlin'),('Coga'),('mrs_lindsay0206'),('kathi_bt'),
  ('LetsPlayNoob05'),('dom.stroh'),('louyourboo'),('die.ottes'),
  ('davide__scibetta'),('familiebu'),('einfach.stephi'),('kleinstadtcoco'),
  ('kimjulia'),('agnes.a.rode'),('kleiner.kaefer_'),('justabout.sabrina'),
  ('aenna_xoxo'),('janinakindt'),('dekokrams'),('jonaswinkler'),
  ('eigenheimliebe'),('eimsbude'),('kathie_bt'),('nathis_lifestyle'),
  ('jacqueline.b_'),('tanjaweber'),('lauras._kleinewelt'),('fashionkitchen'),
  ('gluecksmutter'),('buntehunde'),('maryxtastic'),('lulunashka'),
  ('rheinemamas'),('eve.sauter'),('_happy4family_'),('songuel_sonrose'),
  ('the_woodhouse_family'),('mademoiselle.laura'),('leicht.umsetzbar'),
  ('femily.hashtagt'),('die_schens'),('hashixmoto'),('miss_schumiiiiandfamily'),
  ('mrslavieestbelle'),('jacqueline.b.'),('grueslimuesliciaokakao'),
  ('the_millenialsclub'),('marisa.hofmeister'),('vera_intveen'),
  ('Jan_weinrich'),('ninakaempf'),('stefanie.dechant'),('vanillalooove'),
  ('2.be.good.dads'),('_moon_emma_'),('karolina.deiss'),('jackys.familylife'),
  ('endomood_'),('shopping_zeit'),('marcdumitru'),('isabellsjournal'),
  ('eva.besserer'),('sonja.sein'),('thara.vive'),('sina.maas'),
  ('die_mutti__'),('kikidoyouloveme'),('kriskemmetinger'),('annaroiii'),
  ('lisarrey'),('fatmasstory'),('hausnr_8'),('mellisblog'),
  ('sabrinasmamikram'),('djangoholly_crazy_greek_dogs'),('sarahplusdrei'),
  ('hannahsitte'),('aenna.xoxo'),('just.georges.way'),('kimjuliiaa'),
  ('itscaroo'),('patrickheckl'),('vivienrich'),('verenas_mamablog'),
  ('innerbeyouty'),('Papi.of.two'),('stephaniebliem'),('nikisbeautychannel'),
  ('transjoyboy'),('_nativita_'),('dahoam_mit_herz'),('alexperiences'),
  ('herstoryfeed'),('debbischneider'),('marie.znowhite'),('fiichen'),
  ('die.reuters'),('jensfisch'),('mrs.tews'),('vikistr'),
  ('rosarotundhimmlischblau'),('benkauer'),('buildmyhomebytm'),
  ('10imGlück'),('sandraundbetty'),('paulina_sophiee'),('sarahklefisch'),
  ('hello.its.me.anni'),('princessmaikelea'),('fashionik'),
  ('Papas.im.Glück'),('linaandthewild'),('jano.nero.matilda'),
  ('aussie_selfie'),('selinapiecuch'),('mamiplatz'),('Giulia Groth'),
  ('myhorsediary'),('reiterhofd.henn'),('kathiwagener'),('homeheartmade'),
  ('fraulein_flausenimkopf'),('traumjob.mama'),('zuckerwattenwunder'),
  ('Feli_liebt_3_maenner'),('builtmyhomebytm'),('jennifer.wittenberger'),
  ('jess___blog'),('joanaslichtpoesie'),('Eigenheimliebe'),
  ('feli_liebt_3_maenner'),('lisaschnapa'),('labellove84'),('dobbyundjo'),
  ('nil.sahin'),('vivien_rich_'),('elena.schmitz__'),('geliebtes_hus'),
  ('sarah.fbr'),('sophiavanlaak'),('erdbeerzwergerl'),('me__lanie__'),
  ('my_beautyful_things'),('sandra.sicora'),('alessiamoves'),
  ('nohi.loves.eli'),('traumhausprojekt.runie'),('mias_secrets'),
  ('luisamerkentrup'),('lauralehmannofficial'),('papaundpapi'),
  ('siberian_husky_power'),('gloria.glumac'),('katemerlan'),
  ('janinasarahwestphal'),('Jill Lange'),('lilawolke_testet'),
  ('susanne_twentytwoplotts'),('claudiafie'),('jennamiller'),
  ('werbauteinhaus'),('villa.v.interieur'),('home_and_interior'),
  ('lenaschreiber'),('_babsi_ba'),('heikegerkrath'),('curvywelt'),
  ('kerstincolucci'),('kathi_on_her_journey'),('two.moms.one.journey'),
  ('travelista.aa'),('vika.rusch'),('cassycassau'),('running.ronja'),
  ('stephie_esspunkt'),('miss.puschinella'),('isabellajahn_'),
  ('yonca_amero'),('the_equestrian_couple'),('svenhphotography'),
  ('Moritzdenninger'),('Nina_schwoerer'),('bettinafuchs___'),
  ('sandys.bunte.welt'),('svenjafuxs'),('ordnungsverliebt_'),('laxobu'),
  ('liebevoll.aufwachsen'),('celineft1'),('diana_pekic'),('lea_tntw'),
  ('janihager'),('emilylior'),('leni.isst'),('diebellies'),('jule.popule'),
  ('fiona_bliedtner'),('alpenbaby'),('patriciakraft'),('loeckchenzauber'),
  ('_Vanessasiel'),('unterwegsmitjulia'),('Aenna.xoxo'),('laura.hrsh'),
  ('our.best.journey'),('saniskates'),('esthercrash'),('liaundalfi'),
  ('officialyvonnemouhlen'),('woelbchen'),('_leahsr'),('Alexa Anton'),
  ('selinaosoul'),('aboutnati__'),('justsayeleanor'),('Gloria.Glumac'),
  ('dinas.snacks'),('the.hendersons'),('gebardis'),('vallixpauline'),
  ('_11imglueck'),('cocolie.brokkoli'),('frau.wonnevoll'),
  ('fabulous_nougat'),('mrs_ermerson'),('caroline.helming'),('villaneubi'),
  ('dr.med_muellner'),('nina.reality'),('bully.joia'),('miraams'),
  ('onlyalinii'),('just.gocycling'),('maggieee_yt'),('fine.nld'),
  ('pius_saier'),('vanessa.niederl'),('familyfun_mileyswelt'),('thats.mi'),
  ('konfettiimherz'),('lisa_liilaa'),('adagranda_'),('frani.fine'),
  ('kristinathrills'),('insight.bohogarden'),('ana.snider'),('fitaudrey'),
  ('allaboutjjas'),('AllesJut'),('nedaxamiri'),('naddyblack2.0'),
  ('jennyjcby'),('eva.maria_meidl'),('saskia_and_family'),('runlinirun'),
  ('lisa.schnapa'),('Michael Smolik'),('terri.myr'),('selinasknopf'),
  ('lawa_living'),('julias_kleinewelt'),('carlotta.xx'),('Lea-Sophie Jell'),
  ('Milo My Hero'),('nessiontour'),('mimilawrencefitness'),('Anja Fee'),
  ('die.homrichs'),('Isabeau'),('frieda.lewin'),('palinamin'),('jiggyjules'),
  ('maike.laube'),('bydustinn'),('absoluthedda'),('catsperte'),
  ('gestuet_wickeschliede'),('bkh_miezenglueck'),('dailykugel'),
  ('muddivated'),('saraviktoria_'),('lenaschiwiora'),('fraeulein.diy'),
  ('emma.spinsthewheel'),('life.to.go'),('happybrackmann'),
  ('markus_ebeling_reisen_natur'),('runninglisamarie'),('geraldineschuele'),
  ('anni_interior_love'),('katharina_eisenblut_offiziell'),('stadtlandrad'),
  ('geparrke'),('irina_pasternak'),('nh7_cycling'),('julius.runride'),
  ('die.marinaaa'),('Kati.nfr'),('irina__pasternak'),('luisasmiling'),
  ('aileen.kxs'),('jagras_home'),('wandercroissant'),('Sihamdelphine'),
  ('Holzwurm79'),('bonnyundkleid'),('louisematejczyk'),('_yvonne3009_'),
  ('foerde_fraeulein'),('adagranada_'),('house_of_wood_'),('nicolnic90'),
  ('karoarafa'),('Noel Dederichs'),('FenjaKlindworth'),('lisajungx'),
  ('mrs.marlisa'),('mallieee_'),('insight.boho.garden'),('the_equestrian'),
  ('Annikaaroundtheworld_'),('Annikazion'),('tara.vive'),
  ('selinaosoul (happykatalina)'),('happykatalina'),
  ('house_of_wood_'),(' house_of_wood_ '),
  ('karolina.deiss '),('sarahklefisch '),('jess___blog '),
  ('eva.maria_meidl '),('maike.laube '),('saraviktoria_ '),
  ('geraldineschuele '),('maryxtastic ')
) AS t(influencer_name)
WHERE NOT EXISTS (
  SELECT 1 FROM influencers WHERE influencers.name = t.influencer_name
);

-- Step 3: Create temporary function for importing campaigns
CREATE OR REPLACE FUNCTION import_campaign_batch(
  p_brand_name text,
  p_influencer_name text,
  p_channel text,
  p_content_type text,
  p_story_date date,
  p_reminder_date date,
  p_teaser_date date,
  p_has_reminder boolean,
  p_has_teaser boolean,
  p_cost numeric,
  p_est_views integer,
  p_real_views integer,
  p_cpm numeric,
  p_link_clicks integer,
  p_revenue numeric,
  p_roas numeric,
  p_product text,
  p_month text,
  p_year integer,
  p_manager text,
  p_status text
) RETURNS void AS $$
DECLARE
  v_brand_id uuid;
  v_influencer_id uuid;
  v_channel_clean text;
  v_status_clean text;
BEGIN
  -- Clean channel value
  v_channel_clean := CASE 
    WHEN p_channel = 'ig' THEN 'instagram' 
    WHEN p_channel = 'yt' THEN 'youtube' 
    ELSE NULL 
  END;
  
  -- Clean status value
  v_status_clean := CASE 
    WHEN p_status = 'done' THEN 'completed' 
    WHEN p_status = 'tbd' THEN 'planned' 
    ELSE 'active' 
  END;

  -- Get brand ID
  SELECT id INTO v_brand_id FROM brands WHERE name = p_brand_name LIMIT 1;
  
  -- Get influencer ID (try exact match first, then with trimmed spaces)
  SELECT id INTO v_influencer_id FROM influencers 
  WHERE name = p_influencer_name 
     OR name = TRIM(p_influencer_name)
  LIMIT 1;
  
  -- Only insert if both IDs exist
  IF v_brand_id IS NOT NULL AND v_influencer_id IS NOT NULL THEN
    INSERT INTO campaigns (
      brand_id, influencer_id, campaign_name,
      channel, content_type, story_public_date,
      reminder_date, teaser_date, has_reminder, has_teaser,
      actual_cost, target_views, actual_views, cpm_estimated,
      link_clicks, revenue, roas, promoted_product,
      campaign_month, campaign_year, manager_code, status
    ) VALUES (
      v_brand_id, 
      v_influencer_id, 
      p_brand_name || ' - ' || p_influencer_name || ' - ' || COALESCE(p_month, '') || ' ' || COALESCE(p_year::text, ''),
      v_channel_clean,
      p_content_type, 
      p_story_date,
      p_reminder_date, 
      p_teaser_date, 
      p_has_reminder, 
      p_has_teaser,
      p_cost, 
      p_est_views, 
      p_real_views, 
      p_cpm,
      p_link_clicks, 
      p_revenue, 
      p_roas, 
      p_product,
      p_month, 
      p_year, 
      p_manager,
      v_status_clean
    )
    ON CONFLICT (brand_id, influencer_id, story_public_date, content_type) 
    WHERE story_public_date IS NOT NULL
    DO UPDATE SET
      actual_cost = EXCLUDED.actual_cost,
      target_views = EXCLUDED.target_views,
      actual_views = EXCLUDED.actual_views,
      cpm_estimated = EXCLUDED.cpm_estimated,
      link_clicks = EXCLUDED.link_clicks,
      revenue = EXCLUDED.revenue,
      roas = EXCLUDED.roas,
      promoted_product = EXCLUDED.promoted_product,
      campaign_month = EXCLUDED.campaign_month,
      campaign_year = EXCLUDED.campaign_year,
      manager_code = EXCLUDED.manager_code,
      status = EXCLUDED.status;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Now copy all the SELECT import_campaign_batch statements from complete-campaign-import.sql
-- These are the actual campaign importsSELECT import_campaign_batch('Bauhaus', 'quintyna', 'ig', 'story', '2024-11-07', NULL, NULL, false, false, 320.0, 10000, NULL, 32.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'mariannastyletrends', 'ig', 'story', '2024-11-07', NULL, NULL, false, false, 180.0, 5000, NULL, 36.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Störtebekker', 'happy_brackmann', 'ig', 'story inkl. rem.', '2024-11-10', '2024-11-17', NULL, true, false, 700.0, 20000, 7000, 35.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Störtebekker', 'papi.of.two', 'ig', 'story inkl. rem.', '2024-11-14', '2024-11-22', NULL, true, false, 300.0, 10000, NULL, 30.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'plotterkrams', 'ig', 'story inkl. rem.', '2024-11-19', '2024-11-21', NULL, true, false, 680.0, 20000, NULL, 34.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'tina_mom_91', 'ig', 'story', '2024-11-27', NULL, NULL, false, false, 250.0, 9000, NULL, 28.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('heideman', 'mariannastyletrends', 'ig', 'story inkl. rem.', '2024-11-27', '2024-11-28', NULL, true, false, 180.0, 5000, NULL, 36.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('heideman', 'blondbynana', 'ig', 'story inkl. rem.', '2024-11-26', '2024-11-28', NULL, true, false, 700.0, 30000, NULL, 23.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'kathiwohnt', 'ig', 'story', '2024-11-29', NULL, NULL, false, false, 200.0, 5000, NULL, 40.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'flightgirl.sarah', 'ig', 'story', '2024-11-29', NULL, NULL, false, false, 150.0, 3000, NULL, 50.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'yasemin.bdx', 'ig', 'story + teaser', '2024-11-29', NULL, '2024-11-27', false, true, 480.0, 13000, NULL, 37.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'stephis.familienleben', 'ig', 'story', '2024-11-29', NULL, NULL, false, false, 270.0, 10000, NULL, 27.0, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'zoelwe', 'ig', 'story + teaser', '2024-11-29', NULL, NULL, false, true, 150.0, 3000, NULL, 50.0, 120, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'diedaywalker', 'ig', 'story', '2024-11-29', NULL, NULL, false, false, 1.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'janna.ferdi', 'ig', 'story inkl. rem.', '2024-11-29', '2024-12-04', NULL, true, false, 300.0, 10000, NULL, 30.0, 150, NULL, NULL, NULL, 'November', 2024, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'sabrinaroeder', 'ig', 'story inkl. rem.', '2024-12-04', '2024-12-06', NULL, true, false, 360.0, 10000, NULL, 36.0, NULL, NULL, NULL, 'Handyhüllen', 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2024-12-05', NULL, NULL, false, false, 250.0, 9000, NULL, 28.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'lykke.linda', 'ig', 'story', '2024-12-05', NULL, NULL, false, false, 200.0, 5000, NULL, 40.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'blondbynana', 'ig', 'story', '2024-12-05', NULL, NULL, false, false, 700.0, 30000, NULL, 23.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'deinetanzlehrerin', 'ig', 'story inkl. rem.', '2024-12-06', '2024-12-07', NULL, true, false, NULL, 20000, NULL, NULL, NULL, NULL, NULL, NULL, 'December', 2024, 'JT', 'done');
SELECT import_campaign_batch('Stryve', 'plotterkrams', 'ig', 'story inkl. rem.', '2024-12-06', '2024-12-08', NULL, true, false, 680.0, 20000, NULL, 34.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'der_flory', 'ig', 'story', '2024-12-06', NULL, NULL, false, false, 300.0, 10000, NULL, 30.0, NULL, NULL, NULL, NULL, 'December', 2024, 'JT', 'done');
SELECT import_campaign_batch('Stryve', 'leila.kocht', 'ig', 'story', '2024-12-06', NULL, NULL, false, false, 100.0, 4000, NULL, 25.0, NULL, NULL, NULL, NULL, 'December', 2024, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'mrs.linchenn', 'ig', 'story', '2024-12-08', NULL, NULL, false, false, 250.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Allroundo GaN', 'December', 2024, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'deinetanzlehrerin', 'ig', 'story inkl. rem.', '2024-12-08', '2024-12-12', NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Allroundo GaN', 'December', 2024, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'der_flory', 'ig', 'story inkl. rem.', '2024-12-09', '2024-12-12', NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Allroundo GaN & Air Beats Go weiß', 'December', 2024, 'JT', 'done');
SELECT import_campaign_batch('Störtebekker', 'sabrinaroeder', 'ig', 'story inkl. rem.', '2024-12-10', '2024-12-13', NULL, true, false, 360.0, 10000, NULL, 36.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'tschossl', 'ig', 'story inkl. rem.', '2024-12-11', '2024-12-14', NULL, true, false, 750.0, 28000, NULL, 27.0, NULL, NULL, NULL, 'Handyhüllen & Airpods Case', 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Störtebekker', 'Eckerlin', 'yt', 'yt', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2024, 'JT', 'done');
SELECT import_campaign_batch('Störtebekker', 'Coga', 'yt', 'yt', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2024, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'mrs_lindsay0206', 'ig', 'story inkl. rem.', '2024-12-14', '2024-12-18', NULL, true, false, 300.0, 12000, NULL, 25.0, NULL, NULL, NULL, 'Handyhüllen & Metallarmband schwarz', 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Störtebekker', 'mrs_lindsay0206', 'ig', 'story inkl. rem.', '2024-12-13', '2024-12-15', NULL, true, false, 300.0, 12000, NULL, 25.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'kathi_bt', 'ig', 'story inkl. rem.', '2024-12-15', '2024-12-17', NULL, true, false, 200.0, 12000, NULL, 17.0, NULL, NULL, NULL, 'Handyhüllen & Backflip Mag', 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'sabrinaroeder', 'ig', 'story inkl. rem.', '2024-12-16', '2024-12-19', NULL, true, false, 360.0, 10000, NULL, 36.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Störtebekker', 'LetsPlayNoob05', 'yt', 'yt', '2024-12-20', NULL, NULL, false, false, 600.0, 10000, NULL, 60.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'dom.stroh', 'ig', 'story', '2024-12-23', NULL, NULL, false, false, 0.0, 2000, NULL, NULL, NULL, NULL, NULL, NULL, 'December', 2024, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'kathiwohnt', 'ig', 'story inkl. rem.', '2024-12-28', '2024-12-29', NULL, true, false, 250.0, 5, 5000, 50.0, NULL, NULL, NULL, 'Handyhüllen & Air Beats Go', 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'louyourboo', 'ig', 'story inkl. rem.', '2024-12-29', '2024-12-31', NULL, true, false, 875.0, 25000, NULL, 35.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'die.ottes', 'ig', 'story', '2024-12-31', NULL, NULL, false, false, 100.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'December', 2024, 'JT', 'done');
SELECT import_campaign_batch('Störtebekker', 'davide__scibetta', 'yt', 'yt', NULL, NULL, NULL, false, false, 300.0, 10000, NULL, 30.0, NULL, NULL, NULL, NULL, NULL, 2024, 'LS', 'tbd');
SELECT import_campaign_batch('Störtebekker', 'davide__scibetta', 'ig', 'story', NULL, NULL, NULL, false, false, 700.0, 10000, NULL, 70.0, NULL, NULL, NULL, NULL, NULL, 2024, 'LS', 'tbd');
SELECT import_campaign_batch('Störtebekker', 'familiebu', 'ig', 'story inkl. rem.', '2024-12-28', '2025-01-02', NULL, true, false, 800.0, 25000, NULL, 32.0, NULL, NULL, NULL, NULL, 'December', 2024, 'LS', 'tbd');
SELECT import_campaign_batch('Zahnheld', 'die.ottes', 'ig', 'story', '2025-01-02', NULL, NULL, false, false, 100.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'die.ottes', 'ig', 'story', '2025-01-04', NULL, NULL, false, false, 100.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Handyhüllen', 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'quintyna', 'ig', 'story inkl. rem.', '2025-01-08', '2025-01-10', NULL, true, false, 320.0, 10, NULL, 32.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('ImmoScout24', 'janna.ferdi', 'ig', 'story inkl. rem.', '2025-01-10', NULL, NULL, true, false, 300.0, 10000, NULL, 30.0, 150, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'einfach.stephi', 'ig', 'story', '2025-01-11', NULL, NULL, false, false, 250.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Stryve', 'sabrinaroeder', 'ig', 'story inkl. rem.', '2025-01-13', '2025-01-15', NULL, true, false, 360.0, 10, NULL, 36.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'tina_mom_91', 'ig', 'story', '2025-01-14', NULL, NULL, false, false, 250.0, 9, NULL, 28.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'plotterkrams', 'ig', 'story inkl. rem.', '2025-01-17', '2025-01-19', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('ImmoScout24', 'kleinstadtcoco', 'ig', 'story', '2025-01-17', NULL, NULL, false, false, 3.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'quintyna', 'ig', 'story inkl. rem.', '2025-01-20', '2025-01-22', NULL, true, false, 320.0, 10000, NULL, 32.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('ImmoScout24', 'yasemin.bdx', 'ig', 'story inkl. rem.', '2025-01-21', '2025-01-24', NULL, true, false, 550.0, 12, NULL, 46.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'kimjulia', 'ig', 'story', '2025-01-22', NULL, NULL, false, false, 0.0, 3, NULL, 0.0, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2024-01-23', NULL, NULL, false, false, 250.0, 9, NULL, 28.0, NULL, NULL, NULL, NULL, 'January', 2024, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'plotterkrams', 'ig', 'story + teaser', '2025-01-23', NULL, NULL, false, true, 680.0, 20, NULL, 34.0, 588, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('ImmoScout24', 'agnes.a.rode', 'ig', 'story', '2025-01-24', NULL, NULL, false, false, 950.0, 19, NULL, 50.0, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'mrs.linchenn', 'ig', 'story', '2025-01-24', NULL, NULL, false, false, 250.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'kleiner.kaefer_', 'ig', 'story inkl. rem.', '2025-01-27', '2025-01-29', NULL, true, false, 150.0, 4, NULL, 38.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('ImmoScout24', 'justabout.sabrina', 'ig', 'story', '2025-01-27', NULL, NULL, false, false, 1.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'zoelwe', 'ig', 'story inkl. rem.', '2025-01-28', '2025-01-30', NULL, true, false, 150.0, 3000, NULL, 50.0, 120, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'stephis.familienleben', 'ig', 'story inkl. rem.', '2025-01-28', '2025-01-30', NULL, true, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'aenna_xoxo', 'ig', 'story inkl. rem.', '2025-01-29', NULL, NULL, true, false, 550.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'janinakindt', 'ig', 'story', '2025-01-29', NULL, NULL, false, false, 215.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Handyhülle & Infinity Go', 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-01-30', NULL, NULL, false, false, 250.0, 9, NULL, 28.0, NULL, NULL, NULL, NULL, 'January', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'der_flory', 'ig', 'story', '2025-01-30', NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'justabout.sabrina', 'ig', 'story', '2025-01-30', NULL, NULL, false, false, 1.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('ImmoScout24', 'dekokrams', 'ig', 'story', '2025-01-30', NULL, NULL, false, false, 800.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('ImmoScout24', 'jonaswinkler', 'ig', 'story', '2025-01-30', NULL, NULL, false, false, 1.5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'done');
SELECT import_campaign_batch('ImmoScout24', 'eigenheimliebe', 'ig', 'story', '2025-01-29', NULL, NULL, false, false, 1.45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'January', 2025, 'JT', 'active');
SELECT import_campaign_batch('ImmoScout24', 'eimsbude', 'ig', 'story', '2025-02-03', NULL, NULL, false, false, 850.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'February', 2025, 'JT', 'planned');
SELECT import_campaign_batch('Zahnheld', 'kathie_bt', 'ig', 'story inkl. rem.', '2025-02-03', '2025-02-05', NULL, true, false, 200.0, 12, NULL, 17.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'nathis_lifestyle', 'ig', 'story inkl. rem.', '2025-02-04', '2025-02-06', NULL, true, false, NULL, 1, NULL, 0.0, NULL, NULL, NULL, 'Evergreen Mag & Apple Watch Armbänder', 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'jacqueline.b_', 'ig', 'story inkl. rem.', '2025-02-04', '2025-02-06', NULL, true, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, 'Handyhüllen', 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'tanjaweber', 'ig', 'story inkl. rem.', '2025-02-06', '2025-02-02', NULL, true, false, 550.0, 28, NULL, 20.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'lauras._kleinewelt', 'ig', 'story inkl. rem.', '2025-02-06', '2025-02-08', NULL, true, false, 200.0, 5, NULL, 40.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'fashionkitchen', 'ig', 'story inkl. rem.', '2025-02-06', '2025-02-13', NULL, true, false, 450.0, 13, NULL, 35.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-02-06', NULL, NULL, false, false, 250.0, 9, NULL, 28.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'gluecksmutter', 'ig', 'story inkl. rem.', '2025-02-06', '2025-02-09', NULL, true, false, 450.0, 10, NULL, 45.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'buntehunde', 'ig', 'story', '2025-02-06', NULL, NULL, false, false, 450.0, 16, NULL, 28.0, NULL, NULL, NULL, NULL, 'February', 2025, 'SB', 'done');
SELECT import_campaign_batch('Bauhaus', 'maryxtastic', 'ig', 'story', '2025-02-06', NULL, NULL, false, false, 300.0, 7, NULL, 43.0, NULL, NULL, NULL, NULL, 'February', 2025, 'SB', 'done');
SELECT import_campaign_batch('heideman', 'quintyna', 'ig', 'story inkl. rem.', '2025-02-10', '2025-02-12', NULL, true, false, 320.0, 10000, NULL, 32.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('heideman', 'mrs_lindsay0206', 'ig', 'story inkl. rem.', '2025-02-11', '2024-12-13', NULL, true, false, 300.0, 12000, NULL, 25.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'lulunashka', 'ig', 'story inkl. rem.', '2025-02-12', '2025-02-15', NULL, true, false, 700.0, 20, NULL, 35.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'jacqueline.b_', 'ig', 'story inkl. rem.', '2025-02-12', '2025-02-16', NULL, true, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Ameli', 'rheinemamas', 'ig', 'story', '2025-02-13', NULL, NULL, false, false, 0.0, 10, NULL, 0.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Ameli', 'eve.sauter', 'ig', 'story', '2025-02-13', NULL, NULL, false, false, 0.0, 3, NULL, 0.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'jacqueline.b_', 'ig', 'story inkl. rem.', '2025-02-13', '2025-02-15', NULL, true, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'lauras._kleinewelt', 'ig', 'story inkl. rem.', '2025-02-13', '2025-02-16', NULL, true, false, 200.0, 9, NULL, 22.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'der_flory', 'ig', 'story', '2025-02-13', NULL, NULL, false, false, 0.0, 20, NULL, 0.0, NULL, NULL, NULL, NULL, 'February', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'justabout.sabrina', 'ig', 'story inkl. rem.', '2025-02-18', '2025-02-20', NULL, true, false, 750.0, 20, NULL, 38.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', '_happy4family_', 'ig', 'story inkl. rem.', '2025-02-18', '2025-02-19', NULL, true, false, 30.0, 1, NULL, 30.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'songuel_sonrose', 'ig', 'story', '2025-02-20', NULL, NULL, false, false, 200.0, 6, NULL, 31.0, NULL, NULL, NULL, NULL, 'February', 2025, 'SB', 'done');
SELECT import_campaign_batch('Stryve', 'tanjaweber', 'ig', 'story inkl. rem.', '2025-02-20', '2025-02-24', NULL, true, false, 550.0, 28, NULL, 20.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'the_woodhouse_family', 'ig', 'story inkl. rem.', '2025-02-20', '2025-02-22', NULL, true, false, 300.0, 13, NULL, 23.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'mademoiselle.laura', 'ig', 'story inkl. rem.', '2025-02-20', NULL, NULL, true, false, 720.0, NULL, NULL, 0.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'eigenheimliebe', 'ig', 'story', '2025-02-20', NULL, NULL, false, false, 1.45, 40, NULL, 36.0, NULL, NULL, NULL, NULL, 'February', 2025, 'JT', 'done');
SELECT import_campaign_batch('Bauhaus', 'leicht.umsetzbar', 'ig', 'story inkl. rem.', '2025-02-20', '2025-02-22', NULL, true, false, 850.0, 25, NULL, 34.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-02-20', NULL, NULL, false, false, 250.0, 9, NULL, 28.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'femily.hashtagt', 'ig', 'story inkl. rem.', '2025-02-21', '2025-02-26', NULL, true, false, 2.8, 48, NULL, 58.0, NULL, NULL, NULL, NULL, 'February', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'eigenheimliebe', 'ig', 'story', '2025-02-22', NULL, NULL, false, false, 1.45, 40, NULL, 36.0, NULL, NULL, NULL, NULL, 'February', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'the_woodhouse_family', 'ig', 'story inkl. rem.', '2025-02-24', '2025-02-27', NULL, true, false, 300.0, 13, NULL, 23.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'lauras._kleinewelt', 'ig', 'story inkl. rem.', '2025-02-24', '2025-02-27', NULL, true, false, 200.0, 9, NULL, 22.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', '_happy4family_', 'ig', 'story inkl. rem.', '2025-02-24', '2025-02-25', NULL, true, false, 30.0, 1, NULL, 30.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('Stryve', 'janinakindt', 'ig', 'story', '2025-02-25', NULL, NULL, false, false, 215.0, 8, NULL, 27.0, NULL, NULL, NULL, NULL, 'February', 2025, 'JT', 'done');
SELECT import_campaign_batch('Stryve', 'kathie_bt', 'ig', 'story inkl. rem.', '2025-02-26', '2025-02-22', NULL, true, false, 200.0, 12, NULL, 17.0, NULL, NULL, NULL, NULL, 'February', 2025, 'LS', 'done');
SELECT import_campaign_batch('305 Care', 'lauras._kleinewelt', 'ig', 'story inkl. rem.', '2025-02-23', '2025-02-26', NULL, true, false, 120.0, 5, NULL, 24.0, NULL, NULL, NULL, NULL, 'February', 2025, 'SB', 'done');
SELECT import_campaign_batch('305 Care', 'die_schens', 'ig', 'story inkl. rem.', '2025-02-28', '2025-03-01', NULL, true, false, 180.0, 6, NULL, 30.0, NULL, NULL, NULL, NULL, 'February', 2025, 'SB', 'done');
SELECT import_campaign_batch('305 Care', 'hashixmoto', 'ig', 'story inkl. rem.', '2025-02-28', '2025-03-02', NULL, true, false, 90.0, 3, NULL, 30.0, NULL, NULL, NULL, NULL, 'February', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'miss_schumiiiiandfamily', 'ig', 'story inkl. rem.', '2025-03-01', '2025-03-03', NULL, true, false, 900.0, 25, NULL, 36.0, NULL, NULL, NULL, 'Aura Home', 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'mrslavieestbelle', 'ig', 'story inkl. rem.', '2025-03-06', '2025-03-08', NULL, true, false, 660.0, 20, NULL, 33.0, NULL, NULL, NULL, 'Apple Watch Armbänder', 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('305 Care', 'jacqueline.b.', 'ig', 'story inkl. rem.', '2025-03-06', '2025-03-12', NULL, true, false, 350.0, 11, NULL, 32.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('305 Care', 'grueslimuesliciaokakao', 'ig', 'story inkl. rem.', '2025-03-06', '2025-03-09', NULL, true, false, 250.0, 8, NULL, 31.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Ameli', 'the_millenialsclub', 'ig', 'story', '2025-03-06', NULL, NULL, false, false, 0.0, 6, NULL, 0.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('305 Care', 'marisa.hofmeister', 'ig', 'story inkl. rem.', '2025-03-06', '2025-03-09', NULL, true, false, 1.8, 35, NULL, 51.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'vera_intveen', 'ig', 'story inkl. rem.', '2025-03-06', '2025-03-09', NULL, true, false, 1.25, 27, NULL, 46.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'Jan_weinrich', 'ig', 'story inkl. rem.', '2025-03-06', '2025-03-09', NULL, true, false, 500.0, 15, NULL, 33.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'miss_schumiiiiandfamily', 'ig', 'story inkl. rem.', '2025-03-10', '2025-03-13', NULL, true, false, 900.0, 25, NULL, 36.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'ninakaempf', 'ig', 'story inkl. rem.', '2025-03-10', '2025-03-13', NULL, true, false, 1.9, 45, NULL, 42.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Ameli', 'stefanie.dechant', 'ig', 'story', '2025-03-12', NULL, NULL, false, false, 0.0, 5, NULL, 0.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'vanillalooove', 'ig', 'story inkl. rem.', '2025-03-12', '2025-03-15', NULL, true, false, 700.0, 20, NULL, 35.0, NULL, NULL, NULL, 'Apple Watch Armbänder: Milanese Loop', 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', '2.be.good.dads', 'ig', 'story inkl. rem.', NULL, '2025-03-17', NULL, true, false, 1.35, 40, NULL, 34.0, NULL, NULL, NULL, NULL, '3', 2024, 'SB', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-03-13', NULL, NULL, false, false, 250.0, 9, NULL, 28.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'leicht.umsetzbar', 'ig', 'story inkl. rem.', '2025-03-13', NULL, NULL, true, false, 850.0, 25, NULL, 34.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', '_moon_emma_', 'ig', 'story inkl. rem.', '2025-03-14', '2025-03-17', NULL, true, false, 400.0, 15, NULL, 27.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'karolina.deiss', 'ig', 'story inkl. rem.', '2025-03-13', '2025-03-18', NULL, true, false, 1.7, 50, NULL, 34.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'jackys.familylife', 'ig', 'story inkl. rem.', '2025-03-14', '2025-03-18', NULL, true, false, 1.0, 25, NULL, 40.0, NULL, NULL, NULL, 'Fokus: Handyhülle & Evergreen Mag nebenbei', 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('305 Care', 'endomood_', 'ig', 'story inkl. rem.', NULL, '2025-03-17', NULL, true, false, 50.0, 2, NULL, 20.0, NULL, NULL, NULL, NULL, '3', 2024, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'shopping_zeit', 'ig', 'story', '2025-03-17', NULL, NULL, false, false, 0.0, 1, NULL, 0.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'shopping_zeit', 'ig', 'story', '2025-03-17', NULL, NULL, false, false, 0.0, 1, NULL, 0.0, NULL, NULL, NULL, 'Evergreen Mag', 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'the_woodhouse_family', 'ig', 'story inkl. rem.', '2025-03-17', '2025-03-20', NULL, true, false, 300.0, 13, NULL, 23.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Lotto24', 'marcdumitru', 'ig', 'story', '2025-03-18', NULL, NULL, false, false, 600.0, 15, NULL, 40.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Ameli', 'isabellsjournal', 'ig', 'story', '2025-03-18', NULL, NULL, false, false, 0.0, 9, NULL, 0.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'eva.besserer', 'ig', 'story inkl. rem.', '2025-03-18', '2025-03-21', NULL, true, false, 400.0, 13, NULL, 31.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('305 Care', 'sonja.sein', 'ig', 'story', '2025-03-19', NULL, NULL, false, false, 575.0, 12, NULL, 46.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'thara.vive', 'ig', 'story inkl. rem.', '2025-03-19', '2025-03-24', NULL, true, false, 400.0, 12, NULL, 33.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'sina.maas', 'ig', 'story inkl. rem.', '2025-03-19', '2025-03-23', NULL, true, false, 150.0, 5, NULL, 30.0, NULL, NULL, NULL, 'Fokus: Air Beats Go & Evergreen Mag nebenbei', 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'der_flory', 'ig', 'story', '2025-03-20', NULL, NULL, false, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, 'Evergreen Mag & Aura Home', 'March', 2025, 'JT', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-03-20', NULL, NULL, false, false, 250.0, 9, NULL, 28.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'die_mutti__', 'ig', 'story inkl. rem.', '2025-03-20', '2025-03-22', NULL, true, false, 900.0, 20, NULL, 45.0, NULL, NULL, NULL, NULL, 'March', 2025, 'JT', 'done');
SELECT import_campaign_batch('TerraCanis', 'kikidoyouloveme', 'ig', 'story', '2025-03-21', NULL, NULL, false, false, 6.0, 150, NULL, 40.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'kriskemmetinger', 'ig', 'story inkl. rem.', '2025-03-23', '2025-03-23', NULL, true, false, 100.0, 8, NULL, 13.0, NULL, NULL, NULL, 'Allroundo GaN & Evergreen Mag', 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('305 Care', 'annaroiii', 'ig', 'story', '2025-03-24', '2025-03-26', NULL, false, false, 350.0, 9, NULL, 39.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Lotto24', 'lisarrey', 'ig', 'story', '2025-03-25', NULL, NULL, false, false, 7.0, 150, NULL, 47.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'fatmasstory', 'ig', 'story inkl. rem.', '2025-03-26', '2025-03-28', NULL, true, false, 1.0, 23000, NULL, 43.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('Bauhaus', 'einfach.stephi', 'ig', 'story', '2025-03-27', NULL, NULL, false, false, 350.0, 10, NULL, 35.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'eigenheimliebe', 'ig', 'story inkl. rem.', '2025-03-27', '2025-03-30', NULL, true, false, 1.45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'hausnr_8', 'ig', 'story inkl. rem.', '2025-03-27', '2025-03-30', NULL, true, false, 400.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'mellisblog', 'ig', 'story inkl. rem.', '2025-03-27', '2025-03-29', NULL, true, false, 900.0, 30, NULL, 30.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'sabrinasmamikram', 'ig', 'story inkl. rem.', '2025-03-27', '2025-03-31', NULL, true, false, 600.0, 15, NULL, 40.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'djangoholly_crazy_greek_dogs', 'ig', 'story inkl. rem.', '2025-03-28', '2025-03-30', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('305 Care', 'sarahplusdrei', 'ig', 'story inkl. rem.', '2025-03-28', '2025-03-31', NULL, true, false, 1.5, 43, NULL, 35.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'hannahsitte', 'ig', 'story inkl. rem.', '2025-03-28', '2025-03-31', NULL, true, false, 350.0, 12, NULL, 29.0, NULL, NULL, NULL, NULL, 'March', 2025, 'SB', 'done');
SELECT import_campaign_batch('IOS', 'tschossl', 'ig', 'story inkl. rem.', '2025-03-28', '2025-03-30', NULL, true, false, 800.0, 36, NULL, 22.0, NULL, NULL, NULL, NULL, 'March', 2025, 'DP', 'done');
SELECT import_campaign_batch('Zahnheld', 'aenna.xoxo', 'ig', 'story', '2025-03-28', NULL, NULL, false, false, 650.0, 15, NULL, 43.0, NULL, NULL, NULL, NULL, 'March', 2025, 'JT', 'done');
SELECT import_campaign_batch('IOS', 'just.georges.way', 'ig', 'story', '2025-03-30', NULL, NULL, false, false, 0.0, 4, NULL, 0.0, NULL, NULL, NULL, NULL, 'March', 2025, 'JT', 'done');
SELECT import_campaign_batch('Ameli', 'kimjuliiaa', 'ig', 'story + teaser', '2025-03-30', '2025-04-02', NULL, false, true, 0.0, 4, NULL, 0.0, NULL, NULL, NULL, NULL, 'March', 2025, 'JT', 'done');
SELECT import_campaign_batch('Ameli', 'itscaroo', 'ig', 'reel', '2025-03-30', NULL, NULL, false, false, 0.0, 35, NULL, 0.0, NULL, NULL, NULL, NULL, 'March', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'femily.hashtagt', 'ig', 'story inkl. rem.', '2025-03-31', '2025-04-03', NULL, true, false, 2.8, 60, NULL, 47.0, NULL, NULL, NULL, 'Allroundo GaN', 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'einfach.stephi', 'ig', 'story', '2025-03-31', NULL, NULL, false, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'done');
SELECT import_campaign_batch('Ameli', 'itscaroo', 'ig', 'story', '2025-04-02', NULL, NULL, false, false, 0.0, 35, NULL, 0.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'patrickheckl', 'ig', 'story inkl. rem.', '2025-04-02', '2025-04-04', NULL, true, false, 1.4, 50, NULL, 28.0, NULL, NULL, NULL, 'Armbänder + Evergreen Mag', 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('KikiKoala', 'vivienrich', 'ig', 'story inkl. rem.', '2025-04-02', '2025-04-06', NULL, true, false, 500.0, 22, NULL, 23.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('KikiKoala', 'verenas_mamablog', 'ig', 'story', '2025-04-02', NULL, NULL, false, false, 75.0, 7, NULL, 11.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'mellisblog', 'ig', 'story inkl. rem.', '2025-04-02', '2025-04-04', NULL, true, false, 1.1, 30, NULL, 37.0, NULL, NULL, NULL, 'Evergeen Mag', 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'patrickheckl', 'ig', 'story inkl. rem.', '2025-04-03', '2025-04-06', NULL, true, false, 1.4, 50, NULL, 28.0, NULL, NULL, NULL, 'Schallzahnbürste', 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-04-03', NULL, NULL, false, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'innerbeyouty', 'ig', 'story inkl. rem.', '2025-04-03', '2025-04-07', NULL, true, false, 650.0, 16, NULL, 41.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('IOS', 'der_flory', 'ig', 'story inkl. rem.', '2025-04-04', '2025-04-13', NULL, true, false, 300.0, 20, NULL, 15.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('IOS', 'Papi.of.two', 'ig', 'story inkl. rem.', '2025-04-04', '2025-04-11', NULL, true, false, 400.0, 11, NULL, 34.0, NULL, NULL, NULL, NULL, 'April', 2025, 'DP', 'done');
SELECT import_campaign_batch('KikiKoala', 'stephaniebliem', 'ig', 'story', '2025-04-06', '2025-04-09', NULL, false, false, 300.0, 20, NULL, 15.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('TerraCanis', 'Jan_weinrich', 'ig', 'story inkl. rem.', '2025-04-07', '2025-04-10', NULL, true, false, 500.0, 15, NULL, 33.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'nikisbeautychannel', 'ig', 'story inkl. rem.', '2025-04-07', '2025-04-13', NULL, true, false, 350.0, 11, NULL, 32.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'justabout.sabrina', 'ig', 'story inkl. rem.', '2025-04-07', '2025-04-10', NULL, true, false, 750.0, 20, NULL, 38.0, NULL, NULL, NULL, 'Armbänder + Evergreen Mag', 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'tina_mom_91', 'ig', 'story inkl. rem.', '2025-04-08', '2025-04-10', NULL, true, false, 400.0, 12, NULL, 33.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('IOS', 'transjoyboy', 'ig', 'story', '2025-04-08', NULL, NULL, false, false, 550.0, 12, NULL, 46.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', '_nativita_', 'ig', 'story inkl. rem.', '2025-04-08', '2025-04-10', NULL, true, false, 1.1, 30, NULL, 37.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'dahoam_mit_herz', 'ig', 'story inkl. rem.', '2025-04-08', '2025-04-10', NULL, true, false, 460.0, 15, NULL, 31.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('IOS', 'alexperiences', 'ig', 'story', NULL, NULL, NULL, false, false, 300.0, 8, NULL, 38.0, NULL, NULL, NULL, NULL, NULL, 2024, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'herstoryfeed', 'ig', 'story inkl. rem.', '2025-04-09', '2025-04-16', NULL, true, false, 1.75, 50, NULL, 35.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('305 Care', 'debbischneider', 'ig', 'story inkl. rem.', '2025-04-11', '2025-04-18', NULL, true, false, 1.1, 37, NULL, 30.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('305 Care', 'marisa.hofmeister', 'ig', 'story inkl. rem.', '2025-04-11', '2025-04-21', NULL, true, false, 1.8, 35, NULL, 51.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'marie.znowhite', 'ig', 'story inkl. rem.', '2025-04-11', '2025-04-14', NULL, true, false, 150.0, 5000, NULL, 30.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('IOS', '2.be.good.dads', 'ig', 'story inkl. rem.', '2025-04-12', NULL, NULL, true, false, 1.35, 40, NULL, 34.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'fiichen', 'ig', 'story inkl. rem.', '2025-04-12', '2025-04-15', NULL, true, false, 900.0, 19000, NULL, 47.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'die.reuters', 'ig', 'story inkl. rem.', '2025-04-13', '2025-04-16', NULL, true, false, 700.0, 25000, NULL, 28.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('IOS', 'jensfisch', 'ig', 'story', '2025-04-13', NULL, NULL, false, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('TerraCanis', 'vera_intveen', 'ig', 'story inkl. rem.', '2025-04-14', '2025-04-17', NULL, true, false, 1.25, 27, NULL, 46.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'mrs.tews', 'ig', 'story inkl. rem.', '2025-04-14', '2025-04-18', NULL, true, false, 1.15, 30000, NULL, 38.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'mellisblog', 'ig', 'story inkl. rem.', '2025-04-15', '2025-04-17', NULL, true, false, 1.1, 28000, NULL, 39.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', '_moon_emma_', 'ig', 'story inkl. rem.', '2025-04-16', '2025-04-19', NULL, true, false, 300.0, 15, NULL, 20.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'thara.vive', 'ig', 'story inkl. rem.', '2025-04-16', '2024-04-19', NULL, true, false, 400.0, 12, NULL, 33.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2024-04-17', NULL, NULL, false, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, NULL, 'April', 2024, 'LS', 'done');
SELECT import_campaign_batch('305 Care', 'karolina.deiss', 'ig', 'story inkl. rem.', '2025-04-17', '2025-04-19', NULL, true, false, 1.7, 50, NULL, 34.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'vikistr', 'ig', 'story inkl. rem.', '2025-04-17', '2025-04-21', NULL, true, false, 500.0, 9, NULL, 56.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'posted');
SELECT import_campaign_batch('305 Care', 'rosarotundhimmlischblau', 'ig', 'story inkl. rem.', '2025-04-18', '2025-04-23', NULL, true, false, 650.0, 20, NULL, 33.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Bauhaus', '_nativita_', 'ig', 'story inkl. rem.', '2025-04-17', '2025-04-19', NULL, true, false, 1.1, 30, NULL, 37.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'eva.besserer', 'ig', 'story inkl. rem.', '2024-04-19', '2024-04-24', NULL, true, false, 400.0, 13, NULL, 31.0, NULL, NULL, NULL, NULL, 'April', 2024, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'hannahsitte', 'ig', 'story inkl. rem.', '2025-04-22', '2025-04-25', NULL, true, false, 350.0, 12, NULL, 29.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('IOS', 'benkauer', 'ig', 'story', '2025-04-22', '2025-04-28', NULL, false, false, 3.0, 72, NULL, 42.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('TerraCanis', '2.be.good.dads', 'ig', 'story inkl. rem.', '2025-04-23', '2025-04-28', NULL, true, false, 1.35, 40, NULL, 34.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-04-24', NULL, NULL, false, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'posted');
SELECT import_campaign_batch('Bauhaus', 'buildmyhomebytm', 'ig', 'story inkl. rem.', '2025-04-24', '2025-04-27', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'posted');
SELECT import_campaign_batch('Bauhaus', 'eigenheimliebe', 'ig', 'story inkl. rem.', '2025-04-24', NULL, NULL, true, false, 1.45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'posted');
SELECT import_campaign_batch('Zahnheld', '10imGlück', 'ig', 'story inkl. rem.', '2025-04-24', '2025-04-26', NULL, true, false, 3.0, 95, NULL, 32.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', '_moon_emma_', 'ig', 'story inkl. rem.', '2025-04-25', '2025-04-28', NULL, true, false, 400.0, 15, NULL, 27.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('305 Care', 'sandraundbetty', 'ig', 'story inkl. rem.', '2025-04-26', '2025-04-29', NULL, true, false, 630.0, 15, NULL, 42.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'nikisbeautychannel', 'ig', 'story inkl. rem.', '2025-04-26', '2025-04-29', NULL, true, false, 350.0, 11, NULL, 32.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-04-28', '2025-04-30', NULL, true, false, 550.0, 10, NULL, NULL, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'sarahklefisch', 'ig', 'story inkl. rem.', '2025-04-28', '2025-05-02', NULL, true, false, 1.8, 40, NULL, 45.0, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'posted');
SELECT import_campaign_batch('Hydraid', 'hello.its.me.anni', 'ig', 'story inkl. rem.', '2025-04-29', '2025-05-06', NULL, true, false, 240.0, 8, NULL, 30.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LB', 'done');
SELECT import_campaign_batch('Hydraid', 'princessmaikelea', 'ig', 'story', '2025-04-29', NULL, NULL, false, false, 600.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'done');
SELECT import_campaign_batch('IOS', 'fashionik', 'ig', 'story inkl. rem.', '2025-04-27', '2025-05-04', NULL, true, false, 150.0, 4, NULL, 32.0, NULL, NULL, NULL, NULL, 'April', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', 'Papas.im.Glück', 'ig', 'story inkl. rem.', '2025-04-27', '2025-04-29', NULL, true, false, 500.0, 14, NULL, 34.0, NULL, NULL, NULL, NULL, 'April', 2025, 'DP', 'done');
SELECT import_campaign_batch('Rudelkönig', 'miss_schumiiiiandfamily', 'ig', 'story inkl. rem.', '2025-04-11', '2025-04-19', NULL, true, false, 900.0, 24, NULL, 37.0, NULL, NULL, NULL, 'Kofferraumschutz', 'April', 2025, 'DP', 'posted');
SELECT import_campaign_batch('Rudelkönig', 'buntehunde', 'ig', 'story inkl. rem.', '2025-04-20', '2025-04-23', NULL, true, false, 400.0, 22, NULL, 18.0, NULL, NULL, NULL, 'Kofferraumschutz', 'April', 2025, 'DP', 'posted');
SELECT import_campaign_batch('Rudelkönig', 'linaandthewild', 'ig', 'story', '2025-04-21', NULL, NULL, false, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, '2x Hundegeschirr Paola', 'April', 2025, 'DP', 'posted');
SELECT import_campaign_batch('Rudelkönig', 'jano.nero.matilda', 'ig', 'story inkl. rem.', '2025-04-21', '2025-04-23', NULL, true, false, 250.0, 8, NULL, 29.0, NULL, NULL, NULL, 'Kofferraumschutz', 'April', 2025, 'DP', 'posted');
SELECT import_campaign_batch('Rudelkönig', 'aussie_selfie', 'ig', 'story inkl. rem.', '2025-04-21', '2025-04-24', NULL, true, false, 80.0, 2, NULL, 38.0, NULL, NULL, NULL, 'Kofferraumschutz', 'April', 2025, 'DP', 'posted');
SELECT import_campaign_batch('Rudelkönig', 'selinapiecuch', 'ig', 'story', '2025-04-23', NULL, NULL, false, false, 550.0, 27, NULL, 20.0, NULL, NULL, NULL, 'Kofferraumschutz', 'April', 2025, 'DP', 'posted');
SELECT import_campaign_batch('Rudelkönig', 'mamiplatz', 'ig', 'story inkl. rem.', '2025-04-25', '2025-04-28', NULL, true, false, 1.1, 25, NULL, 44.0, NULL, NULL, NULL, 'Kofferraumschutz', 'April', 2025, 'DP', 'posted');
SELECT import_campaign_batch('Rudelkönig', 'Giulia Groth', 'ig', 'story inkl. rem.', '2025-04-23', '2025-04-26', NULL, true, false, 700.0, 51, NULL, 14.0, NULL, NULL, NULL, 'Kofferraumschutz', 'April', 2025, 'DP', 'posted');
SELECT import_campaign_batch('Vonmählen', 'myhorsediary', 'ig', 'story', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2024, 'JT', 'active');
SELECT import_campaign_batch('KikiKoala', 'reiterhofd.henn', 'ig', 'story', '2025-04-09', NULL, NULL, false, false, 150.0, 8, NULL, 19.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'on hold');
SELECT import_campaign_batch('KikiKoala', 'tina_mom_91', 'ig', 'story', '2025-04-14', NULL, NULL, false, false, 300.0, 12, NULL, 25.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'on hold');
SELECT import_campaign_batch('KikiKoala', 'kathiwagener', 'ig', 'story', '2025-04-10', NULL, NULL, false, false, 100.0, 18, NULL, 6.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'on hold');
SELECT import_campaign_batch('KikiKoala', 'homeheartmade', 'ig', 'story', '2025-04-07', NULL, NULL, false, false, 3.0, 75, NULL, 40.0, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'on hold');
SELECT import_campaign_batch('KikiKoala', 'stephis.familienleben', 'ig', 'story inkl. rem.', '2025-04-08', '2025-04-11', NULL, true, false, 400.0, 13, NULL, 31.0, NULL, NULL, NULL, NULL, 'April', 2025, 'LS', 'on hold');
SELECT import_campaign_batch('KikiKoala', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-04-21', '2025-04-25', NULL, true, false, 550.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'April', 2025, 'JT', 'on hold');
SELECT import_campaign_batch('Bauhaus', 'fashionkitchen', 'ig', 'story inkl. rem.', '2025-03-06', '2025-03-10', NULL, true, false, 450.0, 13, NULL, 35.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'not posted');
SELECT import_campaign_batch('Bauhaus', 'mrslavieestbelle', 'ig', 'story inkl. rem.', '2025-03-20', '2025-03-23', NULL, true, false, 660.0, 20, NULL, 33.0, NULL, NULL, NULL, NULL, 'March', 2025, 'LS', 'tbd');
SELECT import_campaign_batch('Bauhaus', 'miss_schumiiiiandfamily', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 900.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2024, 'LS', 'tbd');
SELECT import_campaign_batch('TerraCanis', 'djangoholly_crazy_greek_dogs', 'ig', 'story inkl. rem.', '2025-04-24', '2025-04-28', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'April', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'fashionkitchen', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 450.0, 13, NULL, 35.0, NULL, NULL, NULL, NULL, NULL, 2024, 'LS', 'tbd');
SELECT import_campaign_batch('TERRACanis', 'fraulein_flausenimkopf', 'NULL', 'NULL', NULL, NULL, NULL, false, false, 250.0, 10, NULL, 25.0, NULL, NULL, NULL, NULL, NULL, 2024, NULL, 'active');
SELECT import_campaign_batch('Vonmählen', 'nathis_lifestyle', 'ig', 'story', '2025-05-01', NULL, NULL, false, false, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Rudelkönig', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-05-01', '2025-05-08', NULL, true, false, 570.0, 10, NULL, 57.0, NULL, NULL, NULL, 'Emma Set, Hundepfeife Kunststoff, Seilspielzeug, Keramikschale doppelpack', 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Rudelkönig', 'janinakindt', 'ig', 'story inkl. rem.', '2025-05-03', '2025-05-06', NULL, true, false, 300.0, 14, NULL, 21.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'einfach.stephi', 'ig', 'story inkl. rem.', '2025-05-05', '2025-05-08', NULL, true, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'traumjob.mama', 'ig', 'story inkl. rem.', '2025-05-05', '2025-05-07', NULL, true, false, 2.8, 20, NULL, 140.0, NULL, 3.274, 117.0, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('TerraCanis', 'kikidoyouloveme', 'ig', 'story', '2025-05-05', NULL, NULL, false, false, 6.0, 150, NULL, 40.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'eigenheimliebe', 'ig', 'story inkl. rem.', '2025-05-05', '2025-05-07', NULL, true, false, 1.4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'zuckerwattenwunder', 'ig', 'story inkl. rem.', '2025-05-05', '2025-05-12', NULL, true, false, 1.2, 30, NULL, 40.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'die.reuters', 'ig', 'story inkl. rem.', '2025-05-06', '2025-05-09', NULL, true, false, 700.0, 25000, NULL, 28.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'janinakindt', 'ig', 'story inkl. rem.', '2025-05-06', '2025-05-10', NULL, true, false, 300.0, 14, NULL, 21.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Bauhaus', 'der_flory', 'ig', 'story', '2025-05-08', NULL, NULL, false, false, 450.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('Bauhaus', 'Feli_liebt_3_maenner', 'ig', 'story inkl. rem.', '2025-05-08', '2025-05-11', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'builtmyhomebytm', 'ig', 'story inkl. rem.', '2025-05-08', '2025-05-11', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'jennifer.wittenberger', 'ig', 'story inkl. rem.', '2025-05-08', '2025-05-11', NULL, true, false, 450.0, 14, NULL, 32.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-05-08', NULL, NULL, false, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('305 Care', 'jess___blog', 'ig', 'story inkl. rem.', '2025-05-09', '2025-05-13', NULL, true, false, 1.0, 28, NULL, 36.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'femily.hashtagt', 'ig', 'story inkl. rem.', '2025-05-10', '2025-05-12', NULL, true, false, 2.8, 60, NULL, 47.0, NULL, NULL, NULL, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'joanaslichtpoesie', 'ig', 'story', '2025-05-11', NULL, NULL, false, false, 2.35, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('Hydraid', 'verenas_mamablog', 'ig', 'story inkl. rem.', '2025-05-12', '2025-05-19', NULL, true, false, 100.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'LB', 'done');
SELECT import_campaign_batch('Rudelkönig', 'Eigenheimliebe', 'ig', 'story inkl. rem.', '2025-05-12', '2025-05-14', NULL, true, false, 1.47, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', '_nativita_', 'ig', 'story inkl. rem.', '2025-05-12', '2025-05-14', NULL, true, false, 1.1, 30, NULL, 37.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'ninakaempf', 'ig', 'story inkl. rem.', '2025-05-12', '2025-05-15', NULL, true, false, 1.9, 45, NULL, 42.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'jacqueline.b_', 'ig', 'story inkl. rem.', '2025-05-12', '2025-05-15', NULL, true, false, 250.0, 8, NULL, 31.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Rudelkönig', 'justabout.sabrina', 'ig', 'story inkl. rem.', '2025-05-12', '2025-05-15', NULL, true, false, 1.1, 22, NULL, 48.0, NULL, NULL, NULL, 'Kofferraumschutz', 'May', 2025, 'DP', 'done');
SELECT import_campaign_batch('IEA', 'feli_liebt_3_maenner', 'ig', 'story inkl. rem.', '2025-05-13', '2025-05-15', NULL, true, false, 600.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'lisaschnapa', 'ig', 'story inkl. rem.', '2025-05-13', '2025-05-15', NULL, true, false, 500.0, 14, NULL, 36.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('IEA', 'labellove84', 'ig', 'story inkl. rem.', '2025-05-13', '2025-05-19', NULL, true, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'jennifer.wittenberger', 'ig', 'story inkl. rem.', '2025-05-13', '2025-05-19', NULL, true, false, 450.0, 14, NULL, 32.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('IEA', 'verenas_mamablog', 'ig', 'story inkl. rem.', '2025-05-13', '2025-05-17', NULL, true, false, 120.0, 7, NULL, 17.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'janinakindt', 'ig', 'story inkl. rem.', '2025-05-13', '2025-05-17', NULL, true, false, 300.0, 14, NULL, 21.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'mrslavieestbelle', 'ig', 'story inkl. rem.', '2025-05-14', '2025-05-19', NULL, true, false, 660.0, 20, NULL, 33.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', '_moon_emma_', 'ig', 'story inkl. rem.', '2025-05-14', '2025-05-17', NULL, true, false, 300.0, 15, NULL, 20.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'dobbyundjo', 'ig', 'story inkl. rem.', '2025-05-14', '2025-05-19', NULL, true, false, 1.6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('girlgotlashes', 'nil.sahin', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-18', NULL, true, false, 1.6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('Zahnheld', 'aenna.xoxo', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-18', NULL, true, false, 800.0, 17, NULL, 46.0, NULL, NULL, NULL, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('IEA', 'einfach.stephi', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-18', NULL, true, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'vivien_rich_', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-17', NULL, true, false, 900.0, 30, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'elena.schmitz__', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-19', NULL, true, false, 500.0, 17, NULL, 29.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'dekokrams', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-19', NULL, true, false, 900.0, 30, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'geliebtes_hus', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-19', NULL, true, false, 700.0, 20, NULL, 35.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'sarah.fbr', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-19', NULL, true, false, 400.0, 10, NULL, 40.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'mrslavieestbelle', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-19', NULL, true, false, 660.0, 20, NULL, 33.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Hydraid', 'sophiavanlaak', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-21', NULL, true, false, 400.0, 10, 8, 40.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'djangoholly_crazy_greek_dogs', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-23', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'erdbeerzwergerl', 'ig', 'story inkl. rem.', '2025-05-15', '2025-05-25', NULL, true, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Hydraid', 'me__lanie__', 'ig', 'story inkl. rem.', '2025-05-16', '2025-05-21', NULL, true, false, 500.0, 15, NULL, 33.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LB', 'done');
SELECT import_campaign_batch('Vonmählen', 'verenas_mamablog', 'ig', 'story inkl. rem.', '2025-05-16', '2025-05-20', NULL, true, false, 120.0, 7, NULL, 17.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'zuckerwattenwunder', 'ig', 'story inkl. rem.', '2025-05-16', '2025-05-20', NULL, true, false, 1.2, 30, NULL, 40.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'jess___blog', 'ig', 'story inkl. rem.', '2025-05-17', '2025-05-19', NULL, true, false, 1.0, 28, NULL, 36.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'my_beautyful_things', 'ig', 'story inkl. rem.', '2025-05-18', '2025-05-21', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'eva.besserer', 'ig', 'story inkl. rem.', '2025-05-18', '2025-05-21', NULL, true, false, 400.0, 13, NULL, 31.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'Feli_liebt_3_maenner', 'ig', 'story inkl. rem.', '2025-05-19', '2025-05-22', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'marie.znowhite', 'ig', 'story inkl. rem.', '2025-05-24', '2025-05-26', NULL, true, false, 150.0, 5000, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'labellove84', 'ig', 'story inkl. rem.', '2025-05-20', '2025-05-25', NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'sandra.sicora', 'ig', 'story inkl. rem.', '2025-05-20', '2025-05-22', NULL, true, false, 1.5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'mrslavieestbelle', 'ig', 'story inkl. rem.', '2025-05-20', '2025-05-26', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('IEA', 'tina_mom_91', 'ig', 'story inkl. rem.', '2025-05-21', '2025-05-26', NULL, true, false, 450.0, 12, NULL, 38.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'hannahsitte', 'ig', 'story inkl. rem.', '2025-05-22', '2025-05-25', NULL, true, false, 350.0, 12, NULL, 29.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'thara.vive', 'ig', 'story inkl. rem.', '2025-05-22', '2025-05-25', NULL, true, false, 400.0, 12, NULL, 33.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'lisarrey', 'ig', 'story inkl. rem.', '2025-05-22', '2025-05-26', NULL, true, false, 4.5, 154, NULL, 29.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'vera_intveen', 'ig', 'story inkl. rem.', '2025-05-22', '2025-05-26', NULL, true, false, 1.25, 27, NULL, 46.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Hydraid', 'alessiamoves', 'ig', 'story inkl. rem.', '2025-05-22', '2025-05-28', NULL, true, false, 200.0, 8, NULL, 25.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'nohi.loves.eli', 'ig', 'story inkl. rem.', '2025-05-22', NULL, NULL, true, false, 400.0, 10, NULL, 40.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'traumhausprojekt.runie', 'ig', 'story inkl. rem.', '2025-05-22', '2025-05-25', NULL, true, false, 1.0, 25, NULL, 40.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'innerbeyouty', 'ig', 'story inkl. rem.', '2025-05-22', '2025-05-25', NULL, true, false, 650.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'mias_secrets', 'ig', 'story inkl. rem.', '2025-05-22', NULL, NULL, true, false, 875.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Rudelkönig', 'luisamerkentrup', 'ig', 'story inkl. rem.', '2025-05-24', '2025-05-27', NULL, true, false, 950.0, 21, NULL, 45.0, NULL, NULL, NULL, NULL, 'May', 2025, 'DP', 'done');
SELECT import_campaign_batch('Rudelkönig', 'lauralehmannofficial', 'ig', 'story inkl. rem.', '2025-05-24', '2025-05-26', NULL, true, false, 1.3, 34, NULL, 37.0, NULL, NULL, NULL, 'Kofferraumschutz', 'May', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', 'tschossl', 'ig', 'story inkl. rem.', '2025-05-24', '2025-05-20', NULL, true, false, 800.0, 36, NULL, 22.0, NULL, NULL, NULL, NULL, 'May', 2025, 'DP', 'done');
SELECT import_campaign_batch('305 Care', 'marisa.hofmeister', 'ig', 'story inkl. rem.', '2025-05-25', '2025-05-26', NULL, true, false, 1.8, 35, NULL, 51.0, NULL, NULL, NULL, NULL, 'May', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'labellove84', 'ig', 'story inkl. rem.', '2025-05-26', NULL, NULL, true, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('IOS', 'papaundpapi', 'ig', 'story inkl. rem.', '2025-05-29', '2025-06-03', NULL, true, false, 850.0, 45, NULL, 19.0, NULL, NULL, NULL, NULL, 'May', 2025, 'DP', 'done');
SELECT import_campaign_batch('Vonmählen', 'geliebtes_hus', 'ig', 'story inkl. rem.', '2025-05-26', '2025-05-28', NULL, true, false, 700.0, 20, NULL, 35.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'Feli_liebt_3_maenner', 'ig', 'story inkl. rem.', '2025-05-28', '2025-05-31', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'May', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'verenas_mamablog', 'ig', 'story inkl. rem.', '2025-05-27', '2025-05-30', NULL, true, false, 200.0, 5, NULL, 40.0, NULL, NULL, NULL, NULL, 'May', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', '2.be.good.dads', 'ig', 'story inkl. rem.', '2025-05-31', '2025-06-02', NULL, true, false, 1.5, 40, NULL, 38.0, NULL, NULL, NULL, NULL, 'May', 2025, 'JT', 'done');
SELECT import_campaign_batch('Rudelkönig', 'siberian_husky_power', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, 1, NULL, 0.0, NULL, NULL, NULL, NULL, '5', 2024, 'DP', 'done');
SELECT import_campaign_batch('Rudelkönig', 'siberian_husky_power', 'tiktok', 'tiktok', NULL, NULL, NULL, false, false, 0.0, 5, NULL, 0.0, NULL, NULL, NULL, NULL, '5', 2024, 'DP', 'done');
SELECT import_campaign_batch('girlgotlashes', 'gloria.glumac', 'ig', 'story inkl. rem.', '2025-05-29', '2025-05-31', NULL, true, false, 1.1, 128, NULL, 9.0, NULL, NULL, NULL, NULL, 'May', 2025, 'DP', 'done');
SELECT import_campaign_batch('girlgotlashes', 'katemerlan', 'ig', 'story inkl. rem.', '2025-05-28', '2025-05-30', NULL, true, false, 1.0, 65, NULL, 15.0, NULL, NULL, NULL, NULL, 'May', 2025, 'DP', 'done');
SELECT import_campaign_batch('IEA', 'janinasarahwestphal', 'ig', 'story inkl. rem.', '2025-05-31', '2025-06-04', NULL, true, false, 1.3, 35, 30, 37.0, 1, 1.489, 115.0, 'Migränemaske', 'May', 2025, 'LB', 'done');
SELECT import_campaign_batch('KikiKoala', 'traumjob.mama', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 2.7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2024, 'JT', 'tbd');
SELECT import_campaign_batch('Zahnheld', 'Jill Lange', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 3.0, 95, NULL, 32.0, NULL, NULL, NULL, 'Schallzahnbürste', NULL, 2024, 'SB', 'planned');
SELECT import_campaign_batch('Vonmählen', 'lilawolke_testet', 'ig', 'story inkl. rem.', '2025-06-02', '2025-06-05', NULL, true, false, 500.0, 15, 15, 33.0, 41200, 7393.0, 15.0, 'Evergreen Mag', 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'ninakaempf', 'ig', 'story inkl. rem.', '2025-06-02', '2025-06-05', NULL, true, false, 1.9, 45, NULL, 42.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'susanne_twentytwoplotts', 'ig', 'story inkl. rem.', '2025-06-02', '2025-06-06', NULL, true, false, 525.0, 15, NULL, 35.0, 25500, 18148.0, 35.0, 'Evergreen Mag', 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'labellove84', 'ig', 'story', '2025-06-02', NULL, NULL, false, false, 100.0, 7, NULL, 0.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'claudiafie', 'ig', 'story inkl. rem.', '2025-06-03', NULL, NULL, true, false, 150.0, 3, NULL, 50.0, 6800, 0.0, 0.0, 'Evergreen Mag', 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('IOS', 'patrickheckl', 'ig', 'story inkl. rem.', '2025-06-03', '2025-06-15', NULL, true, false, 1.4, 50, NULL, 28.0, NULL, NULL, NULL, 'IOS Suit', 'June', 2025, 'JT', 'done');
SELECT import_campaign_batch('girlgotlashes', 'jennamiller', 'ig', 'story inkl. rem.', '2025-06-04', '2025-06-11', NULL, true, false, 6.5, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'JT', 'done');
SELECT import_campaign_batch('IEA', 'claudiafie', 'ig', 'story inkl. rem.', '2026-06-04', '2025-06-10', NULL, true, false, 130.0, 3, NULL, 43.0, 2000, 0.0, 0.0, 'Insektenstichheiler + Migränemaske', 'June', 2026, 'LB', 'done');
SELECT import_campaign_batch('Bauhaus', 'dahoam_mit_herz', 'ig', 'story inkl. rem.', '2025-06-05', '2025-06-08', NULL, true, false, 450.0, 15, NULL, 30.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'hausnr_8', 'ig', 'story inkl. rem.', '2025-06-05', '2025-06-07', NULL, true, false, 400.0, 10, NULL, 40.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'werbauteinhaus', 'ig', 'story inkl. rem.', '2025-06-05', '2025-06-10', NULL, true, false, 300.0, 6, NULL, 50.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'builtmyhomebytm', 'ig', 'story inkl. rem.', '2025-06-05', '2025-06-08', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'villa.v.interieur', 'ig', 'story inkl. rem.', '2025-06-05', '2025-06-09', NULL, true, false, 500.0, 13, NULL, 38.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story', '2025-06-05', NULL, NULL, false, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'home_and_interior', 'ig', 'story inkl. rem.', '2025-06-05', '2025-06-09', NULL, true, false, 900.0, 25, NULL, 36.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Hydraid', 'princessmaikelea', 'ig', 'story', '2025-06-06', NULL, NULL, false, false, 600.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Starter Set', 'June', 2025, 'JT', 'done');
SELECT import_campaign_batch('Hydraid', 'lenaschreiber', 'ig', 'story inkl. rem.', '2025-06-06', '2025-06-17', NULL, true, false, 800.0, 13, NULL, 62.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LB', 'done');
SELECT import_campaign_batch('IEA', 'jennifer.wittenberger', 'ig', 'story inkl. rem.', '2025-06-10', NULL, NULL, true, false, 450.0, 14, NULL, 32.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('IEA', 'Giulia Groth', 'ig', 'story inkl. rem.', '2025-06-10', '2025-06-17', NULL, true, false, 800.0, 40, NULL, 20.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LB', 'done');
SELECT import_campaign_batch('IEA', '_babsi_ba', 'ig', 'story inkl. rem.', '2025-06-10', '2025-06-16', NULL, true, false, 500.0, 13, NULL, 38.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LB', 'done');
SELECT import_campaign_batch('Vonmählen', 'sarah.fbr', 'ig', 'story inkl. rem.', '2025-06-10', '2025-06-17', NULL, true, false, 400.0, 10, 7, 40.0, 289, 20164.0, 50.0, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'janinakindt', 'ig', 'story inkl. rem.', '2025-06-12', '2025-06-15', NULL, true, false, 300.0, 14, NULL, 21.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-06-10', '2025-06-17', NULL, true, false, 550.0, 10, 6, 55.0, 23700, 8727.0, 16.0, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'jess___blog', 'ig', 'story inkl. rem.', '2025-06-11', '2025-06-14', NULL, true, false, 1.0, 28, NULL, 36.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'heikegerkrath', 'ig', 'story inkl. rem.', '2025-06-11', '2025-06-17', NULL, true, false, 200.0, 4, NULL, 50.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LB', 'done');
SELECT import_campaign_batch('TerraCanis', '_moon_emma_', 'ig', 'story inkl. rem.', '2025-06-11', '2025-06-14', NULL, true, false, 300.0, 15, NULL, 20.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'patrickheckl', 'ig', 'story inkl. rem.', '2025-06-12', '2025-06-14', NULL, true, false, 1.4, 50, NULL, 28.0, NULL, NULL, NULL, 'Schallzahnbürste', 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'femily.hashtagt', 'ig', 'story inkl. rem.', '2025-06-12', '2025-06-19', NULL, true, false, 2.5, 60, NULL, 42.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'tina_mom_91', 'ig', 'story inkl. rem.', '2025-06-12', NULL, NULL, true, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'miss_schumiiiandfamily', 'ig', 'story inkl. rem.', '2025-06-13', '2025-06-16', NULL, true, false, 900.0, 25, 20, 36.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'curvywelt', 'ig', 'story inkl. rem.', '2025-06-13', '2025-06-16', NULL, true, false, 350.0, 12, NULL, 28.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', 'alexperiences', 'ig', 'story inkl. rem.', '2025-06-07', '2025-06-09', NULL, true, false, 300.0, 8, NULL, 38.0, NULL, NULL, NULL, NULL, 'June', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'labellove84', 'ig', 'story', '2025-06-15', NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'die.reuters', 'ig', 'story inkl. rem.', '2025-06-15', '2025-06-18', NULL, true, false, 700.0, 25, NULL, 28.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'mrs.tews', 'ig', 'story inkl. rem.', '2025-06-15', '2025-06-18', NULL, true, false, 1.15, 30000, NULL, 38.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Hydraid', 'kerstincolucci', 'ig', 'story inkl. rem.', '2025-06-16', '2025-06-23', NULL, true, false, 150.0, 3, NULL, 43.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LB', 'done');
SELECT import_campaign_batch('TerraCanis', 'marie.znowhite', 'ig', 'story inkl. rem.', '2025-06-17', '2025-06-20', NULL, true, false, 150.0, 5, NULL, 30.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Hydraid', 'alessiamoves', 'ig', 'story inkl. rem.', '2025-06-17', '2025-06-20', NULL, true, false, 200.0, 8, NULL, 25.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'kathi_on_her_journey', 'ig', 'story inkl. rem.', '2025-06-17', '2025-06-21', NULL, true, false, 400.0, 16, NULL, 24.0, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', 'two.moms.one.journey', 'ig', 'story inkl. rem.', '2025-06-23', '2025-06-25', NULL, true, false, 450.0, 14, NULL, 32.0, NULL, NULL, NULL, NULL, 'June', 2025, 'JT', 'done');
SELECT import_campaign_batch('Vonmählen', 'travelista.aa', 'ig', 'story', '2025-06-17', NULL, NULL, false, false, 0.0, 5, NULL, 0.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'vika.rusch', 'ig', 'story', '2025-06-18', NULL, NULL, false, false, 0.0, 1, NULL, 0.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Hydraid', 'sophiavanlaak', 'ig', 'story inkl. rem.', '2025-06-18', '2025-06-25', NULL, true, false, 550.0, 10, 8, 55.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'fashionkitchen', 'ig', 'story inkl. rem.', '2025-06-18', '2025-06-21', NULL, true, false, 400.0, 11, NULL, 35.0, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Zahnheld', 'karolina.deiss', 'ig', 'story inkl. rem.', '2025-06-19', '2025-06-21', NULL, true, false, 1.7, 50, NULL, 34.0, NULL, NULL, NULL, 'Schallzahnbürste', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'djangoholly_crazy_greek_dogs', 'ig', 'story inkl. rem.', '2025-06-19', '2025-06-25', NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'cassycassau', 'ig', 'story inkl. rem.', '2025-06-20', NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'vera_intveen', 'ig', 'story inkl. rem.', '2025-06-20', '2025-06-27', NULL, true, false, 1.25, 27, NULL, 46.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'sandra.sicora', 'ig', 'story inkl. rem.', '2025-06-21', '2025-06-23', NULL, true, false, 1.5, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'kathiwagener', 'ig', 'story inkl. rem.', '2025-06-25', '2025-07-01', NULL, true, false, 800.0, 16, NULL, 50.0, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Hydraid', 'running.ronja', 'ig', 'story inkl. rem.', '2025-06-23', NULL, NULL, true, false, 500.0, 10, NULL, 50.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'my_beautyful_things', 'ig', 'story inkl. rem.', '2025-06-23', '2025-06-26', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Hydraid', 'stephie_esspunkt', 'ig', 'story inkl. rem.', '2025-06-25', '2025-06-30', NULL, true, false, 0.0, 90000, NULL, 0.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LB', 'done');
SELECT import_campaign_batch('Zahnheld', '_moon_emma_', 'ig', 'story inkl. rem.', '2025-06-25', '2025-06-27', NULL, true, false, 400.0, 15, NULL, 27.0, NULL, NULL, NULL, 'Schallzahnbürste', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'miss.puschinella', 'ig', 'story inkl. rem.', '2025-06-25', '2025-06-28', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'einfach.stephi', 'ig', 'story inkl. rem.', '2025-06-25', NULL, NULL, true, false, 300.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'dobbyundjo', 'ig', 'story inkl. rem.', '2025-06-26', '2025-07-01', NULL, true, false, 1.6, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Bauhaus', 'leicht.umsetzbar', 'ig', 'story inkl. rem.', '2025-06-26', '2025-06-28', NULL, true, false, 650.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('IOS', 'yonca_amero', 'ig', 'story inkl. rem.', '2025-06-07', '2025-06-10', NULL, true, false, 1.0, 27, NULL, 37.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', 'the_equestrian_couple', 'ig', 'story inkl. rem.', '2025-06-30', '2025-07-03', NULL, true, false, 200.0, 5, NULL, 36.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Zahnheld', 'labellove84', 'ig', 'story inkl. rem.', '2025-06-26', '2025-06-30', NULL, true, false, 100.0, 7, NULL, 14.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'isabellajahn_', 'ig', 'story inkl. rem.', '2025-06-24', '2025-06-27', NULL, true, false, 150.0, 1, NULL, 77.0, NULL, NULL, NULL, 'Wimpernset', 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', 'svenhphotography', 'ig', 'story inkl. rem.', '2025-06-06', '2025-06-09', NULL, true, false, 300.0, 5, NULL, 55.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Rudelkönig', 'dahoam_mit_herz', 'ig', 'story inkl. rem.', '2025-06-04', '2025-06-05', NULL, true, false, 400.0, 9, NULL, 44.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', 'Moritzdenninger', 'ig', 'story inkl. rem.', '2025-06-26', '2025-06-29', NULL, true, false, 400.0, 25, NULL, 16.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('IEA', 'einfach.stephi', 'ig', 'story inkl. rem.', '2025-06-27', '2025-07-01', NULL, true, false, 150.0, 10, NULL, 15.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'aenna.xoxo', 'ig', 'story inkl. rem.', '2025-06-28', '2025-06-30', NULL, true, false, 800.0, 17, NULL, 46.0, NULL, NULL, NULL, 'Schallzahnbürste', 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-06-24', '2025-06-27', NULL, true, false, 550.0, 10, NULL, 55.0, NULL, NULL, NULL, NULL, 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'Nina_schwoerer', 'ig', 'story inkl. rem.', '2025-06-27', '2025-06-30', NULL, true, false, 0.0, 3, NULL, 0.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'bettinafuchs___', 'ig', 'story inkl. rem.', '2025-06-24', '2025-06-27', NULL, true, false, 0.0, 2, NULL, 0.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'sandys.bunte.welt', 'ig', 'story inkl. rem.', '2025-06-23', '2025-06-27', NULL, true, false, 0.0, 20000, NULL, 0.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'svenjafuxs', 'ig', 'story inkl. rem.', '2025-06-20', '2025-06-26', NULL, true, false, 400.0, 14, NULL, 27.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'ordnungsverliebt_', 'ig', 'story inkl. rem.', '2025-06-30', '2025-07-02', NULL, true, false, 180.0, 5, NULL, 32.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LL', 'done');
SELECT import_campaign_batch('TerraCanis', 'siberian_husky_power', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, 1, NULL, NULL, NULL, NULL, NULL, NULL, '6', 2024, 'DP', 'done');
SELECT import_campaign_batch('TerraCanis', 'siberian_husky_power', 'tiktok', 'tiktok', NULL, NULL, NULL, false, false, 0.0, 5, NULL, NULL, NULL, NULL, NULL, NULL, '6', 2024, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'laxobu', 'ig', 'story inkl. rem.', '2025-06-26', '2025-06-30', NULL, true, false, 90.0, 6, NULL, 15.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LL', 'done');
SELECT import_campaign_batch('Purelei', 'liebevoll.aufwachsen', 'ig', 'story inkl. rem.', '2025-06-26', '2025-06-29', NULL, true, false, 190.0, 8, NULL, 21.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LL', 'done');
SELECT import_campaign_batch('Purelei', 'celineft1', 'ig', 'story inkl. rem.', '2025-06-28', '2025-06-30', NULL, true, false, 275.0, 5, NULL, 50.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LL', 'done');
SELECT import_campaign_batch('Purelei', 'diana_pekic', 'ig', 'story inkl. rem.', '2025-06-24', '2025-06-27', NULL, true, false, 450.0, 17, NULL, 26.0, NULL, NULL, NULL, NULL, 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'lea_tntw', 'ig', 'story inkl. rem.', '2025-06-27', '2025-06-30', NULL, true, false, 200.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'lea_tntw', 'tiktok', 'tiktok live', '2025-06-28', NULL, NULL, false, false, 100.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'einfach.stephi', 'ig', 'story inkl. rem.', '2025-06-28', '2025-06-30', NULL, true, false, 350.0, 10, NULL, 35.0, NULL, NULL, NULL, NULL, 'June', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'janihager', 'ig', 'story inkl. rem.', '2025-06-28', '2025-06-30', NULL, true, false, 850.0, 20, NULL, 43.0, NULL, NULL, NULL, NULL, 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-06-28', '2025-06-30', NULL, true, false, 550.0, 10, NULL, 55.0, NULL, NULL, NULL, NULL, 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'emilylior', 'ig', 'story inkl. rem.', '2025-06-28', '2025-06-30', NULL, true, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, NULL, 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'leni.isst', 'ig', 'story inkl. rem.', '2025-06-25', '2025-06-30', NULL, true, false, 950.0, 59, NULL, 16.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'diebellies', 'ig', 'story inkl. rem.', '2025-06-27', '2025-06-30', NULL, true, false, 750.0, 35, NULL, 21.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'jule.popule', 'ig', 'story inkl. rem.', '2025-06-27', '2025-06-29', NULL, true, false, 1.5, 36, NULL, 42.0, NULL, NULL, NULL, NULL, 'June', 2025, 'JT', 'done');
SELECT import_campaign_batch('Purelei', 'fiona_bliedtner', 'ig', 'story inkl. rem.', '2025-06-27', '2025-06-29', NULL, true, false, 100.0, 1, NULL, 67.0, NULL, NULL, NULL, NULL, 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'alpenbaby', 'ig', 'story inkl. rem.', '2025-06-29', '2025-07-01', NULL, true, false, 1.25, 28, NULL, 45.0, NULL, NULL, NULL, NULL, 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'patriciakraft', 'ig', 'story', '2025-06-30', NULL, NULL, false, false, 1.5, 35, NULL, 42.0, NULL, NULL, NULL, NULL, 'June', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'loeckchenzauber', 'ig', 'story inkl. rem.', '2025-06-30', '2025-07-03', NULL, true, false, 950.0, 25, NULL, 38.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', '_Vanessasiel', 'ig', 'story inkl. rem.', '2025-06-30', '2025-07-04', NULL, true, false, 700.0, 17, NULL, 41.0, NULL, NULL, NULL, NULL, 'June', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'unterwegsmitjulia', 'ig', 'story inkl. rem.', '2025-07-01', '2025-07-05', NULL, true, false, 750.0, 19, NULL, 39.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Vonmählen', 'Aenna.xoxo', 'ig', 'story inkl. rem.', '2025-07-02', '2025-07-06', NULL, true, false, 800.0, 17, NULL, 46.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('Purelei', 'laura.hrsh', 'ig', 'story inkl. rem.', '2025-07-02', '2025-07-07', NULL, true, false, 1.0, 38, NULL, 26.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'miss.puschinella', 'ig', 'reel', '2025-07-02', NULL, NULL, false, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'our.best.journey', 'ig', 'story inkl. rem.', '2025-07-02', '2025-07-11', NULL, true, false, 450.0, 16, NULL, 27.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Hydraid', 'sophiavanlaak', 'ig', 'story inkl. rem.', '2025-07-03', '2025-07-09', NULL, true, false, 450.0, 10, NULL, 45.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'saniskates', 'ig', 'story inkl. rem.', '2025-07-03', '2025-07-05', NULL, true, false, 1.75, 50, NULL, 35.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'JT', 'done');
SELECT import_campaign_batch('Bauhaus', 'esthercrash', 'ig', 'story inkl. rem.', '2025-07-03', '2025-07-08', NULL, true, false, 250.0, 8, NULL, 31.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('IEA', 'leicht.umsetzbar', 'ig', 'story inkl. rem.', '2025-07-03', '2025-07-06', NULL, true, false, 850.0, 20, NULL, 43.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'liaundalfi', 'ig', 'story inkl. rem.', '2025-07-03', '2025-07-09', NULL, true, false, 1.0, 47, NULL, 21.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'officialyvonnemouhlen', 'ig', 'story inkl. rem.', '2025-07-04', '2025-07-06', NULL, true, false, 700.0, 38, NULL, 18.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'woelbchen', 'ig', 'story inkl. rem.', '2025-07-04', '2025-07-08', NULL, true, false, 2.5, 55, NULL, 45.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'JT', 'done');
SELECT import_campaign_batch('Purelei', '_leahsr', 'ig', 'story inkl. rem.', '2025-07-04', '2025-07-09', NULL, true, false, 630.0, 18, NULL, 35.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'kriskemmetinger', 'ig', 'story inkl. rem.', '2025-07-04', '2025-07-09', NULL, true, false, 100.0, 8, NULL, 13.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'Alexa Anton', 'ig', 'story inkl. rem.', '2025-07-05', '2025-07-07', NULL, true, false, 0.0, 3, NULL, 0.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'selinaosoul (happykatalina)', 'ig', 'story inkl. rem.', '2025-07-05', '2025-07-09', NULL, true, false, 250.0, 24, NULL, 10.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'aboutnati__', 'ig', 'story inkl. rem.', '2025-07-06', '2025-07-10', NULL, true, false, 180.0, 4, NULL, 39.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'LL', 'done');
SELECT import_campaign_batch('TerraCanis', 'vera_intveen', 'ig', 'story inkl. rem.', '2025-07-06', '2025-07-11', NULL, true, false, 1.25, 27, NULL, 46.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'cassycassau', 'ig', 'reel', '2025-07-07', NULL, NULL, false, false, 0.0, NULL, NULL, 0.0, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'joanaslichtpoesie', 'ig', 'story inkl. rem.', '2025-07-07', '2025-07-13', NULL, true, false, 2.1, 60, NULL, 35.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'jess___blog', 'ig', 'story inkl. rem.', '2025-07-07', '2025-07-09', NULL, true, false, 1.0, 28, NULL, 36.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'justsayeleanor', 'ig', 'story inkl. rem.', '2025-07-07', '2025-07-10', NULL, true, false, 1.3, 29, NULL, 45.0, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('girlgotlashes', 'Gloria.Glumac', 'ig', 'story inkl. rem.', '2025-07-08', '2025-07-10', NULL, true, false, 1.1, 128, NULL, 9.0, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'dinas.snacks', 'ig', 'story inkl. rem.', '2025-07-08', '2025-07-10', NULL, true, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'the.hendersons', 'ig', 'story inkl. rem.', '2025-07-09', '2025-07-14', NULL, true, false, 750.0, 16, NULL, 44.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('Farben Löwe', 'gebardis', 'ig', 'story inkl. rem.', '2025-07-10', '2025-07-17', NULL, true, false, 0.0, 20, NULL, 0.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'susanne_twentytwoplotts', 'ig', 'story inkl. rem.', '2025-07-09', '2025-07-12', NULL, true, false, 280.0, 11, NULL, 24.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'LL', 'done');
SELECT import_campaign_batch('girlgotlashes', 'stephis.familienleben', 'ig', 'story inkl. rem.', '2025-07-10', '2025-07-13', NULL, true, false, 300.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'zuckerwattenwunder', 'ig', 'story inkl. rem.', '2025-07-10', '2025-07-13', NULL, true, false, 450.0, 35, NULL, 13.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'sarah_schleicher_', 'ig', 'story inkl. rem.', '2025-07-10', '2025-07-12', NULL, true, false, 200.0, 8, NULL, 25.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'dahoam_mit_herz', 'ig', 'story inkl. rem.', '2025-07-10', '2025-07-12', NULL, true, false, 450.0, 15, NULL, 30.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'vallixpauline', 'ig', 'story inkl. rem.', '2025-07-18', '2025-07-21', NULL, true, false, 1.0, 23, NULL, 43.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', '_babsi_ba', 'ig', 'story inkl. rem.', '2025-07-10', '2025-07-13', NULL, true, false, 600.0, 18, NULL, 33.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Zahnheld', '_moon_emma_', 'ig', 'story inkl. rem.', '2025-07-11', '2025-07-13', NULL, true, false, 300.0, 15, NULL, 20.0, NULL, NULL, NULL, 'Schallzahnbürste', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IOS', 'svenhphotography', 'ig', 'story inkl. rem.', '2025-07-11', '2025-07-14', NULL, true, false, 300.0, 5, NULL, 55.0, NULL, NULL, NULL, NULL, 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'stephis.familienleben', 'ig', 'story inkl. rem.', '2025-07-11', '2025-07-14', NULL, true, false, 250.0, 12, NULL, 19.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'LL', 'done');
SELECT import_campaign_batch('Purelei', '_11imglueck', 'ig', 'story inkl. rem.', '2025-07-12', '2025-07-14', NULL, true, false, 1.5, 180, NULL, 8.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Rudelkönig', 'aenna_xoxo', 'ig', 'story inkl. rem.', '2025-07-12', '2025-07-14', NULL, true, false, 700.0, 17, NULL, 41.0, NULL, NULL, NULL, '- Schleppleine orange 5m
SELECT import_campaign_batch('Purelei', 'cocolie.brokkoli', 'ig', 'story inkl. rem.', '2025-07-12', '2025-07-15', NULL, true, false, 2.5, 70, NULL, 36.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'frau.wonnevoll', 'ig', 'story inkl. rem.', '2025-07-12', '2025-07-18', NULL, true, false, 650.0, 16, NULL, 39.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'svenjafuxs', 'ig', 'story inkl. rem.', '2025-07-14', '2025-06-18', NULL, true, false, 500.0, 14, NULL, 34.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'fabulous_nougat', 'ig', 'story inkl. rem.', '2025-07-14', '2025-07-16', NULL, true, false, 600.0, 30, NULL, 20.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'mrs_ermerson', 'ig', 'story inkl. rem.', '2025-07-12', '2025-07-15', NULL, true, false, 2.0, 50, NULL, 40.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-07-13', '2025-07-15', NULL, true, false, 550.0, 10, NULL, 55.0, NULL, NULL, NULL, 'Schallzahnbürste', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'caroline.helming', 'ig', 'story inkl. rem.', '2025-07-13', '2025-07-22', NULL, true, false, 1.0, 28, NULL, 36.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'villaneubi', 'ig', 'story inkl. rem.', '2025-07-13', '2025-07-15', NULL, true, false, 400.0, 23, NULL, 17.0, NULL, NULL, NULL, NULL, 'July', 2025, NULL, 'done');
SELECT import_campaign_batch('Purelei', 'dr.med_muellner', 'ig', 'story inkl. rem.', '2025-07-13', '2025-07-16', NULL, true, false, 1.5, 25, NULL, 60.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'nina.reality', 'ig', 'story inkl. rem.', '2025-07-13', '2025-07-16', NULL, true, false, 0.0, 4, NULL, 0.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'bully.joia', 'ig', 'story inkl. rem.', '2025-07-14', '2025-07-17', NULL, true, false, 400.0, 8, NULL, 48.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('TerraCanis', 'kikidoyouloveme', 'ig', 'story', '2025-07-14', NULL, NULL, false, false, 6.0, 150, NULL, 40.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Farben Löwe', '_interior_and_more', 'ig', 'story inkl. rem.', '2025-07-14', '2025-07-21', NULL, true, false, 300.0, 10, NULL, 30.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'miraams', 'ig', 'story inkl. rem.', '2025-07-14', '2025-07-17', NULL, true, false, 1.5, 60, NULL, 25.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'my_beautyful_things', 'ig', 'story inkl. rem.', '2025-07-14', '2025-07-17', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'onlyalinii', 'ig', 'tiktok', '2025-07-14', '2025-07-17', NULL, false, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Hydraid', 'lenaschreiber', 'ig', 'story inkl. rem.', '2025-07-15', '2025-07-21', NULL, true, false, 800.0, 13, NULL, 60.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('Hydraid', 'just.gocycling', 'ig', 'story inkl. rem.', '2025-07-15', '2025-07-21', NULL, true, false, 400.0, 11, NULL, 34.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('TerraCanis', 'karolina.deiss', 'ig', 'story inkl. rem.', '2025-07-15', '2025-07-18', NULL, true, false, 1.7, 50, NULL, 34.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Hydraid', 'alessiamoves', 'ig', 'story inkl. rem.', '2025-07-15', '2025-07-17', NULL, true, false, 300.0, 8, NULL, 38.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Farben Löwe', 'sarah_schleicher_', 'ig', 'story inkl. rem.', '2025-07-15', '2025-07-18', NULL, true, false, 200.0, 8, NULL, 25.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'emilylior', 'ig', 'story inkl. rem.', '2025-07-15', '2025-07-18', NULL, true, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'lisajungx', 'ig', 'story inkl. rem.', '2025-07-16', '2025-07-20', NULL, true, false, 1.0, 20, NULL, 50.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'mrs.marlisa', 'ig', 'story inkl. rem.', '2025-07-16', '2025-07-19', NULL, true, false, 500.0, 46, NULL, 11.0, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('girlgotlashes', 'mallieee_', 'ig', 'story inkl. rem.', '2025-07-16', '2025-07-19', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'labellove84', 'ig', 'story', '2025-07-16', '2025-07-21', NULL, false, false, 200.0, 7, NULL, 0.0, NULL, NULL, NULL, 'Schallzahnbürste', 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'janinakindt', 'ig', 'story inkl. rem.', '2025-07-16', '2025-07-18', NULL, true, false, 300.0, 14, NULL, 21.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'maggieee_yt', 'ig', 'story inkl. rem.', '2025-07-17', '2025-07-19', NULL, true, false, 6.0, 144, NULL, 42.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Bauhaus', 'hausnr_8', 'ig', 'story inkl. rem.', '2025-07-17', '2025-07-20', NULL, true, false, 400.0, 10, NULL, 40.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'miss.puschinella', 'ig', 'story inkl. rem.', '2025-07-17', '2025-07-20', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Hydraid', 'fine.nld', 'ig', 'story', '2025-07-17', NULL, NULL, false, false, 0.0, 5, NULL, NULL, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'sandra.sicora', 'ig', 'story inkl. rem.', '2025-07-17', '2025-07-22', NULL, true, false, 1.75, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'dobbyundjo', 'ig', 'story inkl. rem.', '2025-07-18', '2025-07-22', NULL, true, false, 1.6, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'einfach.stephi', 'ig', 'story inkl. rem.', '2025-07-19', '2025-07-21', NULL, true, false, 400.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Schallzahnbürste', 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Farben Löwe', 'saniskates', 'ig', 'story inkl. rem.', '2025-07-20', '2025-07-23', NULL, true, false, 2.5, 50, NULL, 50.0, NULL, NULL, NULL, NULL, 'July', 2025, 'JT', 'done');
SELECT import_campaign_batch('TerraCanis', 'lisarrey', 'ig', 'story inkl. rem.', '2025-07-20', '2025-07-23', NULL, true, false, 4.5, 154, NULL, 29.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-07-21', '2025-07-23', NULL, true, false, 550.0, 10, NULL, 55.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'my_beautyful_things', 'ig', 'story inkl. rem.', '2025-07-21', '2025-07-24', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Schallzahnbürste', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Hydraid', 'pius_saier', 'ig', 'story inkl. rem.', '2025-07-21', '2025-07-25', NULL, true, false, 1.2, 30, NULL, 40.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'vanessa.niederl', 'ig', 'story inkl. rem.', '2025-07-21', '2025-07-25', NULL, true, false, 1.8, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'familyfun_mileyswelt', 'ig', 'story inkl. rem.', '2025-07-21', '2025-07-24', NULL, true, false, 800.0, 22, NULL, 36.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'janinasarahwestphal', 'ig', 'story inkl. rem.', '2025-07-22', '2025-07-28', NULL, true, false, 1.1, 30, NULL, 37.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('Purelei', 'thats.mi', 'ig', 'story inkl. rem.', '2025-07-22', '2025-07-24', NULL, true, false, 3.75, 105, NULL, 36.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'janihager', 'ig', 'story inkl. rem.', '2025-07-22', '2025-07-24', NULL, true, false, 950.0, 20, NULL, 48.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'myhorsediary', 'ig', 'story inkl. rem.', '2025-07-22', '2025-07-30', NULL, true, false, 680.0, 20, NULL, 34.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('IEA', 'konfettiimherz', 'ig', 'story inkl. rem.', '2025-07-22', '2025-07-25', NULL, true, false, 2.8, 80, NULL, 42.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'djangoholly_crazy_greek_dogs', 'ig', 'story inkl. rem.', '2025-07-22', '2025-07-30', NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Hundefutter allgemein', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'laxobu', 'ig', 'story inkl. rem.', '2025-07-22', '2025-07-27', NULL, true, false, 90.0, 6, NULL, 15.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'lisa_liilaa', 'ig', 'story inkl. rem.', '2025-07-24', '2025-07-26', NULL, true, false, 600.0, 14, NULL, 42.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'LL', 'done');
SELECT import_campaign_batch('Hydraid', 'adagranda_', 'ig', 'story inkl. rem.', '2025-07-25', '2025-07-27', NULL, true, false, 1.0, 45, NULL, 22.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'frani.fine', 'ig', 'story inkl. rem.', '2025-07-23', '2025-07-26', NULL, true, false, 250.0, 8, NULL, 31.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'kristinathrills', 'ig', 'story inkl. rem.', '2025-07-29', '2025-07-31', NULL, true, false, 400.0, 17, NULL, 23.0, NULL, NULL, NULL, 'Flirt Filter Set & Starter Set', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Farben Löwe', 'insight.bohogarden', 'ig', 'story', '2025-07-23', '2025-07-30', NULL, false, false, 150.0, 8, NULL, 19.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'buildmyhomebytm', 'ig', 'story inkl. rem.', '2025-07-24', '2025-07-29', NULL, true, false, 600.0, 20, NULL, 30.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Bauhaus', 'eigenheimliebe', 'ig', 'story inkl. rem.', '2025-07-24', '2025-07-27', NULL, true, false, 1.45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'aenna.xoxo', 'ig', 'story inkl. rem.', '2025-07-24', '2025-07-31', NULL, true, false, 800.0, 17, NULL, 47.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('Purelei', 'ana.snider', 'ig', 'story inkl. rem.', '2025-07-25', '2025-07-29', NULL, true, false, 500.0, 0, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'curvywelt', 'ig', 'story inkl. rem.', '2025-07-25', '2025-07-27', NULL, true, false, 350.0, 12, NULL, 28.0, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'jule.popule', 'ig', 'story inkl. rem.', '2025-07-26', '2025-07-30', NULL, true, false, 2.0, 36, NULL, 56.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'fitaudrey', 'ig', 'story inkl. rem.', '2025-07-26', '2025-07-29', NULL, true, false, 1.2, 31, NULL, 39.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'LL', 'done');
SELECT import_campaign_batch('Purelei', 'allaboutjjas', 'ig', 'story inkl. rem.', '2025-07-26', '2025-07-28', NULL, true, false, 0.0, 0, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'celineft1', 'ig', 'story inkl. rem.', '2025-07-26', '2025-07-28', NULL, true, false, 400.0, 5, NULL, 73.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'LL', 'done');
SELECT import_campaign_batch('Purelei', 'AllesJut', 'yt', 'yt', '2025-07-27', NULL, NULL, false, false, 1.5, 55, NULL, 27.0, NULL, NULL, NULL, '300€ Gutschein', 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'nedaxamiri', 'ig', 'story inkl. rem.', '2025-07-27', '2025-07-31', NULL, true, false, 400.0, 15, NULL, 27.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'naddyblack2.0', 'ig', 'story inkl. rem.', '2025-07-27', '2025-07-30', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'jennyjcby', 'ig', 'story inkl. rem.', '2025-07-27', '2025-07-31', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'miss.puschinella', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'liebevoll.aufwachsen', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 190.0, 8, NULL, 21.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'eva.maria_meidl', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 220.0, 6, NULL, 37.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IEA', 'saskia_and_family', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-31', NULL, true, false, 1.8, 51, NULL, 35.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('Hydraid', 'runlinirun', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-31', NULL, true, false, 0.0, 1, NULL, 0.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('girlgotlashes', 'lisa.schnapa', 'ig', 'story inkl. rem.', '2025-07-29', '2025-08-01', NULL, true, false, 480.0, 14, NULL, 34.0, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IOS', 'Michael Smolik', 'ig', 'story inkl. rem.', '2025-07-10', '2025-07-19', NULL, true, false, 2.0, 60, NULL, 33.0, NULL, NULL, NULL, NULL, 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('IOS', 'der_flory', 'ig', 'story inkl. rem.', '2025-07-20', '2025-07-27', NULL, true, false, 300.0, 20, NULL, 15.0, NULL, NULL, NULL, NULL, 'July', 2025, 'JT', 'done');
SELECT import_campaign_batch('Purelei', 'terri.myr', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 150.0, 8, NULL, 19.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'selinasknopf', 'ig', 'story inkl. rem.', '2025-07-24', '2025-07-30', NULL, true, false, 750.0, 20, NULL, 38.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'lawa_living', 'ig', 'story inkl. rem.', '2025-07-26', '2025-07-29', NULL, true, false, 0.0, 40000, NULL, 0.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'julias_kleinewelt', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 400.0, 8, NULL, 50.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'carlotta.xx', 'ig', 'story inkl. rem.', '2025-07-27', '2025-07-31', NULL, true, false, 1.5, 32, NULL, 47.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'Lea-Sophie Jell', 'ig', 'story inkl. rem.', '2025-07-22', '2025-07-24', NULL, true, false, 1.8, 90, NULL, 20.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'Milo My Hero', 'ig', 'story inkl. rem.', '2025-07-27', '2025-07-30', NULL, true, false, 850.0, 49, NULL, 17.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'nessiontour', 'ig', 'story inkl. rem.', '2025-07-30', '2025-08-02', NULL, true, false, 8.0, 340, NULL, 24.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Hydraid', 'sophiavanlaak', 'ig', 'story inkl. rem.', '2025-07-30', '2025-08-05', NULL, true, false, 450.0, 10, NULL, 45.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Purelei', 'mimilawrencefitness', 'ig', 'story inkl. rem.', '2025-07-26', '2025-07-30', NULL, true, false, 2.0, 50, NULL, 40.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'Anja Fee', 'ig', 'story inkl. rem.', '2025-07-24', '2025-07-30', NULL, true, false, 1.5, 100, NULL, 15.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'die.homrichs', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-31', NULL, true, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'Isabeau', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 2.5, 100, NULL, 25.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'frieda.lewin', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 2.5, 50, NULL, 50.0, NULL, NULL, NULL, NULL, 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Purelei', 'diana_pekic', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 500.0, 17, NULL, 29.0, NULL, NULL, NULL, 'Schmuck individuell', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Farben Löwe', 'eigenheimliebe', 'ig', 'story inkl. rem.', '2025-07-28', '2025-07-30', NULL, true, false, 1.8, 45, NULL, 40.0, NULL, NULL, NULL, NULL, 'July', 2025, 'JT', 'done');
SELECT import_campaign_batch('Purelei', 'palinamin', 'ig', 'story inkl. rem.', '2025-07-29', '2025-07-31', NULL, true, false, 4.0, 150, NULL, 27.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Purelei', 'jiggyjules', 'ig', 'story inkl. rem.', '2025-07-29', '2025-07-31', NULL, true, false, 500.0, 13, NULL, 38.0, NULL, NULL, NULL, NULL, 'July', 2025, 'PS', 'done');
SELECT import_campaign_batch('Hydraid', 'princessmaikelea', 'ig', 'story inkl. rem.', '2025-07-30', NULL, NULL, true, false, 1.0, 50, NULL, 20.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'nathis_lifestyle', 'ig', 'story', '2025-07-30', NULL, NULL, false, false, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Vonmählen', 'vivien_rich_', 'ig', 'story inkl. rem.', '2025-07-30', '2025-08-02', NULL, true, false, 900.0, 30, NULL, 30.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'maike.laube', 'ig', 'story inkl. rem.', '2025-07-31', '2025-08-03', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Vonmählen', 'der_flory', 'ig', 'story', '2025-07-31', '2025-08-01', NULL, false, false, 300.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Zahnheld', 'lisa.schnapa', 'ig', 'story inkl. rem.', '2025-07-31', '2025-08-02', NULL, true, false, 540.0, 14, NULL, 39.0, NULL, NULL, NULL, NULL, 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('Zahnheld', 'traumjob.mama', 'ig', 'story inkl. rem.', '2025-07-31', '2025-08-03', NULL, true, false, 2.7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'July', 2025, 'SB', 'done');
SELECT import_campaign_batch('IOS', 'bydustinn', 'ig', 'story inkl. rem.', '2025-07-31', '2025-08-04', NULL, true, false, 2.31, 53, NULL, 43.0, NULL, NULL, NULL, NULL, 'July', 2025, 'DP', 'done');
SELECT import_campaign_batch('Purelei', 'einfach.stephi', 'ig', 'story inkl. rem.', '2025-07-31', '2025-08-02', NULL, true, false, 150.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'July', 2025, 'LS', 'done');
SELECT import_campaign_batch('Hydraid', 'absoluthedda', 'ig', 'story inkl. rem.', '2025-07-31', '2025-08-06', NULL, true, false, 220.0, 5, NULL, 40.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'reminder');
SELECT import_campaign_batch('Hydraid', 'just.gocycling', 'ig', 'story inkl. rem.', '2025-07-31', '2025-08-04', NULL, true, false, 400.0, 11, NULL, 34.0, NULL, NULL, NULL, NULL, 'July', 2025, 'LB', 'done');
SELECT import_campaign_batch('TerraCanis', 'catsperte', 'ig', 'story inkl. rem.', '2025-08-01', NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Schallzahnbürste', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('TerraCanis', 'djangoholly_crazy_greek_dogs', 'ig', 'story inkl. rem.', '2025-08-01', NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Schallzahnbürste', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('TerraCanis', 'gestuet_wickeschliede', 'ig', 'story inkl. rem.', '2025-08-01', NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('TerraCanis', 'bkh_miezenglueck', 'ig', 'story inkl. rem.', '2025-08-01', NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('TerraCanis', 'dailykugel', 'ig', 'story inkl. rem.', '2025-08-01', NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'muddivated', 'ig', 'story inkl. rem.', '2025-08-01', '2025-08-07', NULL, true, false, 500.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Purelei', 'saraviktoria_', 'ig', 'story inkl. rem.', '2025-08-02', '2025-08-04', NULL, true, false, 200.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('girlgotlashes', 'lenaschiwiora', 'ig', 'story inkl. rem.', '2015-08-02', '2025-08-04', NULL, true, false, 1.2, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2015, 'SB', 'briefing');
SELECT import_campaign_batch('Hydraid', 'alessiamoves', 'ig', 'story inkl. rem.', '2025-08-02', '2025-08-05', NULL, true, false, 300.0, 8, NULL, 38.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'done');
SELECT import_campaign_batch('girlgotlashes', 'stephis.familienleben', 'ig', 'story', '2025-08-02', NULL, NULL, false, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'DP', 'briefing');
SELECT import_campaign_batch('IEA', 'heikegerkrath', 'ig', 'story inkl. rem.', '2025-08-02', '2025-08-05', NULL, true, false, 200.0, 4, NULL, 50.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'done');
SELECT import_campaign_batch('Farben Löwe', 'fraeulein.diy', 'ig', 'story inkl. rem.', '2025-08-03', '2025-08-06', NULL, true, false, 500.0, 15, NULL, 33.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'done');
SELECT import_campaign_batch('TerraCanis', 'homeheartmade', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 3.333, 95, NULL, 35.0, NULL, NULL, NULL, 'Hundefutter allgemein', '8', 2024, 'SB', 'planned');
SELECT import_campaign_batch('TerraCanis', 'mrs.tews', 'ig', 'story inkl. rem.', '2025-08-05', '2025-08-08', NULL, true, false, 1.15, 30000, NULL, 38.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Purelei', 'allaboutjjas', 'ig', 'story inkl. rem.', '2025-08-05', '2025-08-07', NULL, true, false, 0.0, 0, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'miss.puschinella', 'ig', 'story inkl. rem.', '2025-08-05', '2025-08-10', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Hydraid', 'emma.spinsthewheel', 'ig', 'story inkl. rem.', '2025-08-06', '2025-08-12', NULL, true, false, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'done');
SELECT import_campaign_batch('Purelei', 'nedaxamiri', 'ig', 'story inkl. rem.', '2025-08-07', '2025-08-10', NULL, true, false, 400.0, 15, NULL, 27.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'caroline.helming', 'ig', 'story inkl. rem.', '2025-08-07', '2025-08-17', NULL, true, false, 1.0, 28, NULL, 36.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'officialyvonnemouhlen', 'ig', 'story inkl. rem.', '2025-08-08', '2025-08-10', NULL, true, false, 700.0, 38, NULL, 18.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'life.to.go', 'ig', 'story inkl. rem.', '2025-08-08', '2025-08-10', NULL, true, false, 1.5, 57, NULL, 26.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'DP', 'planned');
SELECT import_campaign_batch('Purelei', 'Lea-Sophie Jell', 'ig', 'story inkl. rem.', '2025-08-08', '2025-08-12', NULL, true, false, 1.8, 90, NULL, 20.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'jennamiller', 'ig', 'story inkl. rem.', '2025-08-08', '2025-08-15', NULL, true, false, 6.5, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'JT', 'briefing');
SELECT import_campaign_batch('IOS', 'happybrackmann', 'ig', 'story inkl. rem.', '2025-08-08', '2025-08-11', NULL, true, false, 350.0, 14, NULL, 25.0, NULL, NULL, NULL, NULL, 'August', 2025, 'JT', 'briefing');
SELECT import_campaign_batch('Purelei', 'palinamin', 'ig', 'story inkl. rem.', '2025-08-09', '2025-08-22', NULL, true, false, 4.0, 150, NULL, 27.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'jennyjcby', 'ig', 'story inkl. rem.', '2025-08-10', '2025-08-15', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Farben Löwe', 'buildmyhomebytm', 'ig', 'story inkl. rem.', '2025-08-10', '2025-08-13', NULL, true, false, 600.0, 20, NULL, 25.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'posted');
SELECT import_campaign_batch('Purelei', 'frani.fine', 'ig', 'story inkl. rem.', '2025-08-10', '2025-08-12', NULL, true, false, 250.0, 8, NULL, 31.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Valkental', 'markus_ebeling_reisen_natur', 'ig', 'story inkl. rem.', '2025-08-11', '2025-08-15', NULL, true, false, 260.0, 10, NULL, 26.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'posted');
SELECT import_campaign_batch('Purelei', 'frieda.lewin', 'ig', 'story inkl. rem.', '2025-08-11', '2025-08-15', NULL, true, false, 2.5, 50, NULL, 50.0, NULL, NULL, NULL, NULL, 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Purelei', '_11imglueck', 'ig', 'story inkl. rem.', '2025-08-11', '2025-08-14', NULL, true, false, 1.5, 180, NULL, 8.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'my_beautyful_things', 'ig', 'story inkl. rem.', '2025-08-11', '2025-08-14', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Hydraid', 'runninglisamarie', 'ig', 'story inkl. rem.', '2025-08-12', '2025-08-18', NULL, true, false, 250.0, 4, NULL, 52.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'posted');
SELECT import_campaign_batch('Farben Löwe', 'home_and_interior', 'ig', 'story inkl. rem.', '2025-08-12', '2025-08-15', NULL, true, false, 900.0, 25, NULL, 36.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('Purelei', 'mrs_ermerson', 'ig', 'story inkl. rem.', '2025-08-12', '2025-08-15', NULL, true, false, 2.0, 50, NULL, 40.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'patriciakraft', 'ig', 'story', '2025-08-13', NULL, NULL, false, false, 1.5, 35, NULL, 42.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Purelei', 'geraldineschuele', 'ig', 'story inkl. rem.', '2025-08-13', '2025-08-15', NULL, true, false, 3.0, 0, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Hydraid', 'princessmaikelea', 'ig', 'story', '2025-08-13', NULL, NULL, false, false, 1.0, 50, NULL, 20.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'posted');
SELECT import_campaign_batch('Farben Löwe', 'anni_interior_love', 'ig', 'story inkl. rem.', '2025-08-14', '2025-08-19', NULL, true, false, 500.0, 13, NULL, 37.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'planned');
SELECT import_campaign_batch('Valkental', 'tina_mom_91', 'ig', 'story inkl. rem.', '2025-08-14', '2025-08-18', NULL, true, false, 450.0, 12, NULL, 38.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('TerraCanis', 'karolina.deiss', 'ig', 'story inkl. rem.', '2025-08-14', '2025-08-18', NULL, true, false, 1.7, 50, NULL, 34.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Zahnheld', 'geliebtes_hus', 'ig', 'story inkl. rem.', '2025-08-15', '2025-08-18', NULL, true, false, 900.0, 25, NULL, 36.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('girlgotlashes', 'katharina_eisenblut_offiziell', 'ig', 'story inkl. rem.', '2025-08-15', '2025-08-18', NULL, true, false, 2.5, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Zahnheld', 'patrickheckl', 'ig', 'story inkl. rem.', '2025-08-15', '2025-08-21', NULL, true, false, 1.4, 50, NULL, 28.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('Purelei', 'celineft1', 'ig', 'story inkl. rem.', '2025-08-15', '2025-08-17', NULL, true, false, 400.0, 5, NULL, 73.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'LL', 'planned');
SELECT import_campaign_batch('Purelei', 'selinasknopf', 'ig', 'story inkl. rem.', '2025-08-15', '2025-08-18', NULL, true, false, 750.0, 20, NULL, 38.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'lawa_living', 'ig', 'story inkl. rem.', '2025-08-15', '2025-08-18', NULL, true, false, 0.0, 40000, NULL, 0.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Valkental', 'stadtlandrad', 'ig', 'story', '2025-08-15', NULL, NULL, false, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('Riegel', 'eigenheimliebe', 'ig', 'story', '2025-08-15', NULL, NULL, false, false, 1.45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('TerraCanis', 'homeheartmade', 'ig', 'story inkl. rem.', '2025-08-16', '2025-08-19', NULL, true, false, 3.333, 95, NULL, 35.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Purelei', 'miss.puschinella', 'ig', 'story inkl. rem.', '2025-08-16', '2025-08-18', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Hydraid', 'just.gocycling', 'ig', 'story inkl. rem.', '2025-08-16', '2025-08-18', NULL, true, false, 400.0, 11, NULL, 34.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'briefing');
SELECT import_campaign_batch('Purelei', 'sandra.sicora', 'ig', 'story inkl. rem.', '2025-08-16', '2025-08-19', NULL, true, false, 1.75, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'geparrke', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 850.0, 47, NULL, 18.0, NULL, NULL, NULL, 'Wimpernset', '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Zahnheld', 'einfach.stephi', 'ig', 'story inkl. rem.', '2025-08-17', '2025-08-19', NULL, true, false, 450.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('Farben Löwe', 'irina_pasternak', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-21', NULL, true, false, 350.0, 8, NULL, 44.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'planned');
SELECT import_campaign_batch('Purelei', 'vanessa.niederl', 'ig', 'story inkl. rem.', '2025-08-18', '2025-07-22', NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Hydraid', 'nh7_cycling', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-20', NULL, true, false, 0.0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'planned');
SELECT import_campaign_batch('Purelei', 'svenjafuxs', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-21', NULL, true, false, 500.0, 14, NULL, 34.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Zahnheld', 'tanjaweber', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-20', NULL, true, false, 400.0, 10, NULL, 40.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('Purelei', 'julias_kleinewelt', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-20', NULL, true, false, 400.0, 8, NULL, 50.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Hydraid', 'arndlepetitcycliste', 'ig', 'story inkl. rem.', '2025-08-18', NULL, NULL, true, false, 250.0, 5, NULL, 50.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Zahnheld', 'labellove84', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-24', NULL, true, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('IOS', 'patrickheckl', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-30', NULL, true, false, 1.4, 50, NULL, 28.0, NULL, NULL, NULL, NULL, 'August', 2025, 'JT', 'planned');
SELECT import_campaign_batch('Hydraid', 'julius.runride', 'ig', 'story inkl. rem.', '2025-08-21', '2025-08-26', NULL, true, false, 500.0, 10, NULL, 50.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('Purelei', 'carlotta.xx', 'ig', 'story inkl. rem.', '2025-08-19', '2025-08-24', NULL, true, false, 1.5, 32, NULL, 47.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'familyfun_mileyswelt', 'ig', 'story inkl. rem.', '2025-08-19', '2025-08-22', NULL, true, false, 800.0, 22, NULL, 36.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Farben Löwe', 'die.marinaaa', 'ig', 'story inkl. rem.', '2025-08-19', '2025-08-21', NULL, true, false, 1.2, 28, NULL, 43.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('girlgotlashes', 'Kati.nfr', 'ig', 'story inkl. rem.', '2025-08-19', '2025-08-22', NULL, true, false, 600.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Farben Löwe', 'irina__pasternak', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 350.0, 9, NULL, 39.0, NULL, NULL, NULL, NULL, '8', 2024, 'LB', 'planned');
SELECT import_campaign_batch('Purelei', 'jule.popule', 'ig', 'story inkl. rem.', '2025-08-20', '2025-08-24', NULL, true, false, 2.0, 36, NULL, 56.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Hydraid', 'luisasmiling', 'ig', 'story', '2025-08-20', NULL, NULL, false, false, 1.2, 30, NULL, 40.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Purelei', 'woelbchen', 'ig', 'story inkl. rem.', '2025-08-21', '2025-08-24', NULL, true, false, 2.5, 55, NULL, 45.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Hydraid', 'aileen.kxs', 'ig', 'story inkl. rem.', '2025-08-21', '2025-08-25', NULL, true, false, 420.0, 9, NULL, 47.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'planned');
SELECT import_campaign_batch('Riegel', 'hausnr_8', 'ig', 'story inkl. rem.', '2025-08-19', '2025-08-21', NULL, true, false, 400.0, 13, NULL, 31.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'briefing');
SELECT import_campaign_batch('Farben Löwe', 'jagras_home', 'ig', 'story inkl. rem.', '2025-08-21', '2025-08-25', NULL, true, false, 850.0, 22, NULL, 38.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'planned');
SELECT import_campaign_batch('Purelei', 'janihager', 'ig', 'story inkl. rem.', '2025-08-21', '2025-08-24', NULL, true, false, 950.0, 20, NULL, 48.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Valkental', 'wandercroissant', 'ig', 'story inkl. rem.', '2025-08-22', '2025-08-31', NULL, true, false, 150.0, 8, NULL, 19.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Hydraid', 'lenaschreiber', 'ig', 'story inkl. rem.', '2025-08-24', '2025-08-29', NULL, true, false, 800.0, 18, NULL, 44.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LB', 'planned');
SELECT import_campaign_batch('Purelei', 'paulina_sophiee', 'ig', 'story inkl. rem.', '2025-08-24', '2025-08-27', NULL, true, false, 550.0, 10, NULL, 55.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Valkental', 'labellove84', 'ig', 'story inkl. rem.', '2025-08-24', NULL, NULL, true, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Purelei', 'emilylior', 'ig', 'story inkl. rem.', '2025-08-25', '2025-08-27', NULL, true, false, 200.0, 7, NULL, 29.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Farben Löwe', 'Sihamdelphine', 'ig', 'story inkl. rem.', '2025-08-25', '2025-08-27', NULL, true, false, 0.0, 1, NULL, 0.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Farben Löwe', 'Holzwurm79', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, 1, NULL, 0.0, NULL, NULL, NULL, NULL, '8', 2024, 'LS', 'planned');
SELECT import_campaign_batch('Farben Löwe', 'bonnyundkleid', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 400.0, 15, NULL, 27.0, NULL, NULL, NULL, NULL, '8', 2024, 'LS', 'planned');
SELECT import_campaign_batch('Valkental', 'der_flory', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 500.0, 23, NULL, 22.0, NULL, NULL, NULL, NULL, '8', 2024, 'LS', 'planned');
SELECT import_campaign_batch('Purelei', 'bully.joia', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 400.0, 8, NULL, 48.0, NULL, NULL, NULL, 'Schmuck individuell', '8', 2024, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'thats.mi', 'ig', 'story inkl. rem.', '2025-08-26', '2025-08-28', NULL, true, false, 3.75, 105, NULL, 36.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Hydraid', 'sophiavanlaak', 'ig', 'story inkl. rem.', '2025-08-26', '2025-09-01', NULL, true, false, 550.0, 10, NULL, 55.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Valkental', 'louisematejczyk', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 1.5, 50, NULL, 30.0, NULL, NULL, NULL, NULL, '8', 2024, 'LS', 'planned');
SELECT import_campaign_batch('Valkental', '_yvonne3009_', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 500.0, 12, NULL, 42.0, NULL, NULL, NULL, NULL, '8', 2024, 'LS', 'planned');
SELECT import_campaign_batch('Valkental', 'vivien_rich_', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 1.0, 25, NULL, 40.0, NULL, NULL, NULL, NULL, '8', 2024, 'LS', 'planned');
SELECT import_campaign_batch('Valkental', 'tanjaweber', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 400.0, 10, NULL, 40.0, NULL, NULL, NULL, NULL, '8', 2024, 'LS', 'planned');
SELECT import_campaign_batch('Valkental', 'foerde_fraeulein', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 500.0, 8, NULL, 63.0, NULL, NULL, NULL, NULL, '8', 2024, 'LS', 'planned');
SELECT import_campaign_batch('Hydraid', 'adagranada_', 'ig', 'story inkl. rem.', '2025-08-26', '2025-08-31', NULL, true, false, 1.0, 45, NULL, 22.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Farben Löwe', 'house_of_wood_', 'ig', 'story inkl. rem.', '2025-08-29', '2025-08-31', NULL, true, false, 500.0, 13, NULL, 38.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Hydraid', 'princessmaikelea', 'ig', 'story', '2025-08-31', NULL, NULL, false, false, 1.0, 50, NULL, 20.0, NULL, NULL, NULL, NULL, 'August', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Purelei', 'leni.isst', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 950.0, 59, NULL, 16.0, NULL, NULL, NULL, 'Schmuck individuell', '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Purelei', 'ordnungsverliebt_', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 180.0, 5, NULL, 32.0, NULL, NULL, NULL, 'Schmuck individuell', '8', 2024, 'LL', 'planned');
SELECT import_campaign_batch('Purelei', 'diana_pekic', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 500.0, 17, NULL, 29.0, NULL, NULL, NULL, 'Schmuck individuell', '8', 2024, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'liebevoll.aufwachsen', 'ig', 'story inkl. rem.', '2025-08-11', '2025-08-13', NULL, true, false, 190.0, 8, NULL, 21.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'Kati.nfr', 'ig', 'story inkl. rem.', '2025-08-25', '2025-08-28', NULL, true, false, 600.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'stephis.familienleben', 'ig', 'story inkl. rem.', '2025-08-23', '2025-08-27', NULL, true, false, 650.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'DP', 'planned');
SELECT import_campaign_batch('Purelei', 'nicolnic90', 'ig', 'story inkl. rem.', '2025-08-19', '2025-08-27', NULL, true, false, 5.5, 200, NULL, 28.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'maike.laube', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', '8', 2024, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'terri.myr', 'ig', 'story inkl. rem.', '2025-08-11', '2025-08-14', NULL, true, false, 150.0, 8, NULL, 19.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'jiggyjules', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-21', NULL, true, false, 500.0, 13, NULL, 38.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'Milo My Hero', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-20', NULL, true, false, 850.0, 49, NULL, 17.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'nessiontour', 'ig', 'story inkl. rem.', '2025-08-05', '2025-08-07', NULL, true, false, 8.0, 340, NULL, 24.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'die.homrichs', 'ig', 'story inkl. rem.', '2025-08-18', '2025-08-21', NULL, true, false, 250.0, 12, NULL, 21.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'mimilawrencefitness', 'ig', 'story inkl. rem.', '2025-08-20', '2025-08-22', NULL, true, false, 2.0, 50, NULL, 40.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'Anja Fee', 'ig', 'story inkl. rem.', '2025-08-16', '2025-08-21', NULL, true, false, 1.5, 100, NULL, 15.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Purelei', 'Isabeau', 'ig', 'story inkl. rem.', '2025-08-14', '2025-08-16', NULL, true, false, 2.5, 100, NULL, 25.0, NULL, NULL, NULL, NULL, 'August', 2025, 'PS', 'planned');
SELECT import_campaign_batch('Zahnheld', 'karolina.deiss', 'ig', 'story inkl. rem.', '2025-08-21', '2025-08-24', NULL, true, false, 1.7, 50, NULL, 34.0, NULL, NULL, NULL, 'Schallzahnbürste', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('TerraCanis', 'vera_intveen', 'ig', 'story inkl. rem.', '2025-08-11', '2025-08-17', NULL, true, false, 1.25, 27, NULL, 46.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'dobbyundjo', 'ig', 'story inkl. rem.', '2025-08-14', '2025-08-19', NULL, true, false, 1.6, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('girlgotlashes', 'mallieee_', 'ig', 'tiktok', '2025-08-12', NULL, NULL, false, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('girlgotlashes', 'onlyalinii', 'ig', 'tiktok', '2025-08-24', '2025-08-27', NULL, false, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('TerraCanis', 'marie.znowhite', 'ig', 'story inkl. rem.', '2025-08-22', '2025-08-25', NULL, true, false, 150.0, 5, NULL, 30.0, NULL, NULL, NULL, NULL, 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Purelei', 'katharinaivanova', 'ig', 'story inkl. rem.', '2025-08-14', '2025-08-16', NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Kulturwerke', '_happy4family_', 'ig', 'story inkl. rem.', '2025-08-16', '2025-08-18', NULL, true, false, 80.0, 3, NULL, 25.0, NULL, NULL, NULL, NULL, 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Kulturwerke', 'emelybasics', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 450.0, 8, NULL, 56.0, NULL, NULL, NULL, NULL, '8', 2024, 'SB', 'planned');
SELECT import_campaign_batch('Zahnheld', 'aenna.xoxo', 'ig', 'story inkl. rem.', '2025-08-27', NULL, NULL, true, false, 800.0, 17, NULL, 46.0, NULL, NULL, NULL, 'Schallzahnbürste', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('Purelei', 'fraeuleinemmama', 'ig', 'story inkl. rem.', '2025-08-20', '2025-08-24', NULL, true, false, 1.4, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'planned');
SELECT import_campaign_batch('IOS', 'philipp.lipiarski', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, 3, NULL, 0.0, NULL, NULL, NULL, NULL, '8', 2024, 'DP', 'briefing');
SELECT import_campaign_batch('IOS', 'lucafrua', 'ig', 'story inkl. rem.', '2025-08-07', NULL, NULL, true, false, 400.0, 9, NULL, 42.0, NULL, NULL, NULL, NULL, 'August', 2025, 'DP', 'briefing');
SELECT import_campaign_batch('Hydraid', 'Annikazion', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 2.0, 64, NULL, 31.0, NULL, NULL, NULL, NULL, '8', 2024, 'LB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'Marisa Hofmeister', 'ig', 'story inkl. rem.', '2025-08-11', '2025-08-13', NULL, true, false, 1.0, 35, NULL, 29.0, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'DP', 'planned');
SELECT import_campaign_batch('Kulturwerke', 'dielieblingslehrerin', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 250.0, 4, NULL, 56.0, NULL, NULL, NULL, NULL, '8', 2024, 'DP', 'briefing');
SELECT import_campaign_batch('Kulturwerke', 'nedaaxmini', 'ig', 'story inkl. rem.', '2025-08-23', '2025-09-05', NULL, true, false, 700.0, 28700, NULL, 24.0, NULL, NULL, NULL, NULL, 'August', 2025, 'DP', 'briefing');
SELECT import_campaign_batch('Kulturwerke', 'Noel Dederichs', 'ig', 'story inkl. rem.', '2025-08-24', '2025-08-28', NULL, true, false, 850.0, 27000, NULL, 31.0, NULL, NULL, NULL, NULL, 'August', 2025, 'DP', 'briefing');
SELECT import_campaign_batch('Kulturwerke', 'Annikaaroundtheworld_', 'ig', 'story inkl. rem.', '2025-08-24', '2025-08-27', NULL, true, false, 450.0, 14530, NULL, 31.0, NULL, NULL, NULL, NULL, 'August', 2025, 'DP', 'briefing');
SELECT import_campaign_batch('girlgotlashes', 'curvywelt', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 400.0, 12, NULL, 32.0, NULL, NULL, NULL, 'Wimpernset', '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Kulturwerke', 'emilylior', 'ig', 'story inkl. rem.', '2025-08-29', '2025-08-31', NULL, true, false, 400.0, 10, NULL, 40.0, NULL, NULL, NULL, 'Schmuck individuell', 'August', 2025, 'SB', 'briefing');
SELECT import_campaign_batch('girlgotlashes', 'tina_mom_91', 'ig', 'story inkl. rem.', '2025-08-28', '2025-08-31', NULL, true, false, 450.0, 12, NULL, 38.0, NULL, NULL, NULL, 'Wimpernset', 'August', 2025, 'DP', 'planned');
SELECT import_campaign_batch('Zahnheld', 'diana_pekic', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 500.0, 17, NULL, 29.0, NULL, NULL, NULL, 'Wimpernset', '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'diana_pekic', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 500.0, 17, NULL, 29.0, NULL, NULL, NULL, NULL, '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Zahnheld', 'officialyvonnemouhlen', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 700.0, 38, NULL, 18.0, NULL, NULL, NULL, NULL, '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'officialyvonnemouhlen', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 700.0, 38, NULL, 18.0, NULL, NULL, NULL, NULL, '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Zahnheld', 'caroline.helming', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 1.0, 28, NULL, 36.0, NULL, NULL, NULL, NULL, '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'caroline.helming', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 1.0, 28, NULL, 36.0, NULL, NULL, NULL, NULL, '8', 2024, 'DP', 'planned');
SELECT import_campaign_batch('TerraCanis', 'siberian_husky_power', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, 1, NULL, NULL, NULL, NULL, NULL, 'Hundefutter allgemein', NULL, 2024, 'DP', 'planned');
SELECT import_campaign_batch('Purelei', 'leni.isst', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 950.0, 59, NULL, 16.0, NULL, NULL, NULL, 'Schmuck individuell', NULL, 2024, 'DP', 'planned');
SELECT import_campaign_batch('Purelei', 'ordnungsverliebt_', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 180.0, 5, NULL, 32.0, NULL, NULL, NULL, 'Schmuck individuell', NULL, 2024, 'LL', 'planned');
SELECT import_campaign_batch('Purelei', 'katharinaivanova', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', NULL, 2024, 'SB', 'planned');
SELECT import_campaign_batch('Zahnheld', 'miss_schumiiiiandfamily', 'ig', 'story inkl. rem.', '2025-09-01', '2025-09-04', NULL, true, false, 900.0, 25, NULL, 36.0, NULL, NULL, NULL, NULL, 'September', 2025, 'LS', 'planned');
SELECT import_campaign_batch('Valkental', 'stephis.familienleben', 'ig', 'story inkl. rem.', '2025-09-01', '2025-09-08', NULL, true, false, 450.0, 12, NULL, 38.0, NULL, NULL, NULL, NULL, 'September', 2025, 'LS', 'planned');
SELECT import_campaign_batch('TerraCanis', 'homeheartmade', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 3.333, 95, NULL, 35.0, NULL, NULL, NULL, 'Hundefutter allgemein', '9', 2024, 'SB', 'planned');
SELECT import_campaign_batch('TerraCanis', 'karolina.deiss', 'ig', 'story inkl. rem.', '2025-09-15', '2025-09-18', NULL, true, false, 1.7, 50, NULL, 34.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'September', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'woelbchen', 'ig', 'story inkl. rem.', '2025-09-24', '2025-09-28', NULL, true, false, 2.5, 55, NULL, 45.0, NULL, NULL, NULL, 'Schmuck individuell', 'September', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'sandra.sicora', 'ig', 'story inkl. rem.', '2025-09-11', '2025-09-13', NULL, true, false, 1.5, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'September', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Hydraid', 'sophiavanlaak', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 550.0, 10, NULL, 55.0, NULL, NULL, NULL, NULL, '9', 2024, 'LS', 'planned');
SELECT import_campaign_batch('TerraCanis', 'mrs.tews', 'ig', 'story inkl. rem.', '2025-09-02', '2025-09-05', NULL, true, false, 1.15, 30000, NULL, 38.0, NULL, NULL, NULL, 'Hundefutter allgemein', 'September', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Farben Löwe', 'FenjaKlindworth', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 600.0, 15, NULL, 40.0, NULL, NULL, NULL, NULL, '9', 2024, 'LS', 'planned');
SELECT import_campaign_batch('TerraCanis', 'catsperte', 'ig', 'story inkl. rem.', '2025-09-01', NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Schallzahnbürste', 'September', 2025, 'SB', 'planned');
SELECT import_campaign_batch('Farben Löwe', 'kati.nfr', 'ig', 'story inkl. rem.', '2025-09-11', '2025-09-15', NULL, true, false, 550.0, 16, NULL, 34.0, NULL, NULL, NULL, NULL, 'September', 2025, 'LB', 'planned');
SELECT import_campaign_batch('Rudelkönig', 'marie.znowhite', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 150.0, 5, NULL, 30.0, NULL, NULL, NULL, NULL, '9', 2024, 'SB', 'planned');
SELECT import_campaign_batch('Purelei', 'fraeuleinemmama', 'ig', 'story inkl. rem.', '2025-09-15', '2025-09-19', NULL, true, false, 1.4, NULL, NULL, NULL, NULL, NULL, NULL, 'Schmuck individuell', 'September', 2025, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'dobbyundjo', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 1.6, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', '9', 2024, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'Gloria.Glumac', 'ig', 'story inkl. rem.', '2025-09-28', '2025-09-30', NULL, true, false, 1.1, 128, NULL, 9.0, NULL, NULL, NULL, 'Wimpernset', 'September', 2025, 'DP', 'planned');
SELECT import_campaign_batch('Rudelkönig', 'flowmitpaula', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 500.0, 11, NULL, 45.0, NULL, NULL, NULL, NULL, '9', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Rudelkönig', 'siberian_husky_power', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, 1, NULL, 0.0, NULL, NULL, NULL, NULL, '9', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Rudelkönig', 'jano.nero.matilda', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 250.0, 8, NULL, 29.0, NULL, NULL, NULL, NULL, '9', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Rudelkönig', 'djangoholly_crazy_greek_dogs', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9', 2024, 'DP', 'planned');
SELECT import_campaign_batch('Kulturwerke', 'sachemii.teach', 'ig', 'story inkl. rem.', '2025-09-11', '2025-09-14', NULL, true, false, 225.0, 4, NULL, 56.0, NULL, NULL, NULL, NULL, 'September', 2025, 'DP', 'briefing');
SELECT import_campaign_batch('Kulturwerke', 'herr_schmelzer', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9', 2024, 'SB', 'planned');
SELECT import_campaign_batch('girlgotlashes', 'muddivated', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 500.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', '9', 2024, 'SB', 'planned');
SELECT import_campaign_batch('Zahnheld', 'vanessa_be_93', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 600.0, 19, NULL, 32.0, NULL, NULL, NULL, NULL, '9', 2024, 'SB', 'tbd');
SELECT import_campaign_batch('girlgotlashes', 'sandra.sicora', 'ig', 'story inkl. rem.', '2025-10-12', '2025-10-14', NULL, true, false, 1.5, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', 'October', 2025, 'SB', 'planned');
SELECT import_campaign_batch('TerraCanis', 'catsperte', 'ig', 'story inkl. rem.', '2025-10-01', NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Schallzahnbürste', 'October', 2025, 'SB', 'planned');
SELECT import_campaign_batch('TerraCanis', 'theredhotchilicats', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 0.0, NULL, NULL, NULL, NULL, NULL, NULL, 'Hundefutter allgemein', '11', 2024, 'SB', 'tbd');
SELECT import_campaign_batch('girlgotlashes', 'sandra.sicora', 'ig', 'story inkl. rem.', NULL, NULL, NULL, true, false, 1.5, NULL, NULL, NULL, NULL, NULL, NULL, 'Wimpernset', '11', 2024, 'SB', 'planned');

-- Clean up
DROP FUNCTION IF EXISTS import_campaign_batch;

-- Verify counts
SELECT 'Brands' as entity, COUNT(*) FROM brands
UNION ALL
SELECT 'Influencers', COUNT(*) FROM influencers
UNION ALL
SELECT 'Campaigns', COUNT(*) FROM campaigns;
