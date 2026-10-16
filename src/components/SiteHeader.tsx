import { Anchor, Box, Button, Container, Group } from '@mantine/core';
import { Link } from 'react-router';
import classes from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <Box component="header" className={classes.header}>
      <Container size="lg">
        <Group justify="space-between" align="center" wrap="nowrap" h={64}>
          <Anchor component={Link} to="/" underline="never" className={classes.wordmark}>
            SARTAROSH.
          </Anchor>
          <Group gap="lg" wrap="nowrap">
            <Anchor
              component={Link}
              to="/#xizmatlar"
              underline="hover"
              className={classes.navLink}
              visibleFrom="sm"
            >
              Xizmatlar
            </Anchor>
            <Button component={Link} to="/yozilish" size="sm">
              Yozilish
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
