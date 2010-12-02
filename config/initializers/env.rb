env_file = File.join(Rails.root, 'config', 'env.yml')
if File.exists?(env_file)
  YAML::load_file(env_file).each_pair { |k, v| ENV[k] = v }
end