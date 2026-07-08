-- Custom SQL migration file, put your code below! --

-- Seed starting bankrolls: $612.00 live (casino + home), $3.65 online.
INSERT INTO "bankroll_transactions" ("bankroll", "type", "amount", "note") VALUES
  ('live', 'deposit', 61200, 'Starting bankroll'),
  ('online', 'deposit', 365, 'Starting bankroll');
