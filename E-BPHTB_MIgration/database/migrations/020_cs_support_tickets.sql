-- Support tickets (public landing) + CS replies
CREATE TABLE IF NOT EXISTS cs_tickets (
    id              bigserial PRIMARY KEY,
    ticket_id       varchar(32) NOT NULL UNIQUE,
    submitter_name  varchar(255) NOT NULL,
    user_email      varchar(255) NOT NULL,
    subject         text NOT NULL,
    message         text NOT NULL,
    status          varchar(32) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved')),
    unread_by_cs    boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cs_tickets_created ON cs_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cs_tickets_status ON cs_tickets (status);
CREATE INDEX IF NOT EXISTS idx_cs_tickets_unread ON cs_tickets (unread_by_cs) WHERE unread_by_cs = true;

CREATE TABLE IF NOT EXISTS cs_ticket_replies (
    id              bigserial PRIMARY KEY,
    ticket_id       varchar(32) NOT NULL REFERENCES cs_tickets(ticket_id) ON DELETE CASCADE,
    body            text NOT NULL,
    author_type     varchar(16) NOT NULL DEFAULT 'cs'
        CHECK (author_type IN ('cs', 'system')),
    created_by_userid varchar(100),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cs_ticket_replies_ticket ON cs_ticket_replies (ticket_id, created_at);
