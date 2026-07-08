Router.register('/', PageHome);
Router.register('/about', PageAbout);
Router.register('/tactics', PageTactics);
Router.register('/events', PageEvents);
Router.register('/events/:id', PageEventDetail);
Router.register('/roster', PageRoster);
Router.register('/ranks', PageRanks);
Router.register('/apply', PageApply);
Router.register('/gallery', PageGallery);
Router.register('/aars', PageAARList);
Router.register('/aars/new', PageAAREditor);
Router.register('/aars/:id/edit', PageAAREditor);
Router.register('/aars/:id', PageAARDetail);
Router.register('/auth/callback', PageLoginCallback);

Router.register('/admin', PageAdminDashboard);
Router.register('/admin/events', PageAdminEvents);
Router.register('/admin/applications', PageAdminApplications);
Router.register('/admin/roster', PageAdminRoster);
Router.register('/admin/promotions', PageAdminPromotions);

async function bootFSSF() {
  renderFooter();
  await Auth.refresh();
  Auth.onChange(renderNavbar);
  renderNavbar();
  Router.start();
}

bootFSSF();
